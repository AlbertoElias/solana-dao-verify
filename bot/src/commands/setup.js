import { Permissions } from 'discord.js'
import { PublicKey } from '@solana/web3.js'
import { Connection, programs } from '@metaplex/js'
const { metadata: { Metadata } } = programs

import { getServersModel } from '../models/index.js'
import { getBot } from '../bot/index.js'

export default {
    name: '?setup',
    description: 'Setup the bot for your server.',
    async execute(msg, args, sequelize) {
      if (!msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return

      const Servers = getServersModel(sequelize)

      // The Solana address of the collection
      const collectionId = args[0]
      // The Discord ID of the role that will be given to verified users
      const verifiedRole = args[1]
      // Needs to be 'mainnet-beta' or 'devnet'
      const network = args[2] || 'devnet'

      if (!collectionId || !verifiedRole) {
        msg.reply('Please provide a collection id and a verified role.')
        return
      }

      const role = msg.guild.roles.cache.find(role => role.id === verifiedRole)
      if (!role) {
        msg.reply('Please provide a valid verified role.')
      }


      const connection = new Connection(network)
      try {
        const pda = await Metadata.getPDA(new PublicKey(collectionId))
        const ownedMetadata = await Metadata.load(connection, pda)
        if (ownedMetadata) {
          const existingServer = await Servers.findOne({ where: { id: msg.guild.id } })
          if (existingServer) {
            await Servers.update({
              id: msg.guild.id,
              collection: collectionId,
              network,
              verifiedRole
            },
            {
              where: { id:existingServer.id }
            })
          } else {
            await Servers.create({
              id: msg.guild.id,
              collection: collectionId,
              network,
              verifiedRole
            })
          }
          msg.reply(`Collection ${collectionId} and Role ${verifiedRole} successfully configured.`)
        }
      } catch (e) {
        msg.reply(`There was an error setting up your server: ${e}`)
      }
    }
  }