import { getUsersModel, getServersModel, getVerificationsModel } from '../models/index.js'
import { findNftInCollection } from '../utils/solana.js'

export default {
  name: '?verify',
  description: 'Verify your account.',
  async execute(msg, _, sequelize) {
    const Users = getUsersModel(sequelize)
    const Servers = getServersModel(sequelize)
    const Verifications = getVerificationsModel(sequelize)

    try {
      const server = await Servers.findOne({ where: { id: msg.guild.id } })
      if (server) {
        const discordUser = await Users.findOne({ where: { discordId: msg.author.id } })
        if (discordUser) {
          const nft = await findNftInCollection(discordUser.solanaAddress, server.collection, server.network)
          if (nft) {
            const role = msg.guild.roles.cache.find(role => role.id === server.verifiedRole)
            const existingVerification = await Verifications.findOne({ where: { solanaAddress: discordUser.solanaAddress, serverId: server.id } })
            if (existingVerification) {
              await Verifications.update(
                {
                  solanaAddress: discordUser.solanaAddress,
                  serverId: server.id
                },
                { where: { id: existingVerification.id } }
              )
            } else {
              await Verifications.create({
                solanaAddress: discordUser.solanaAddress,
                serverId: server.id
              })
            }
            await msg.member.roles.add(role)
            msg.reply('Your account has been verified with this Server.')
          } else {
            msg.reply('You do not have an NFT from the collection configured for this Discord server.')
          }
        } else {
          msg.reply('Check your DMs to complete the verfication process.')
          msg.author.send(`Please visit ${process.env.WEB_URL}/#verify`)
        }
      } else {
        msg.reply('This bot hasn\'t been setup yet. Please tell an Administrator to use ?setup to setup the bot.')
      }
    } catch (e) {
      console.error(e)
      msg.reply('There was an error verifying your account. Please contact an Administrator.')
    }
  }
}