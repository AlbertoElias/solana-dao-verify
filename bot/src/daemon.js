import 'dotenv/config'
import cron from 'node-cron'
import Sequelize from 'sequelize'
import { Client, Intents } from 'discord.js'

import { getUsersModel, getServersModel, getVerificationsModel } from './models/index.js'
import { findNftInCollection } from './utils/solana.js'

const sequelize = new Sequelize('solanadaoverify', process.env.SQLITE_USER, process.env.SQLITE_PASSWORD, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'solanadaoverify.sqlite',
})
const Users = getUsersModel(sequelize)
const Servers = getServersModel(sequelize)
const Verifications = getVerificationsModel(sequelize)

cron.schedule('* * * * *', () => {
  const bot = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS
    ],
    partials: ['CHANNEL']
  })
  
  bot.on('ready', async () => {
    Users.sync()
    Verifications.sync()
    Servers.sync()
  
    const verifications = await Verifications.findAll()
    for (const verification of verifications) {
      const user = await Users.findOne({ where: { solanaAddress: verification.solanaAddress } })
      const server = await Servers.findOne({ where: { id: verification.serverId } })
  
      if (user && server) {
        const nft = await findNftInCollection(user.solanaAddress, server.collection, server.network)
        if (!nft) {
          const discordServer = bot.guilds.cache.find(guild => guild.id === server.id)
          if (discordServer) {
            const discordUser = await discordServer.members.fetch(user.discordId)
            if (discordUser) {
              const role = discordServer.roles.cache.find(role => role.id === server.verifiedRole)
              await discordUser.roles.remove(role)
            }
          }
          await Verifications.destroy({ where: { id: verification.id } })        
        }
      }
    }
  
    bot.destroy()
  })
  
  bot.login(process.env.DISCORD_BOT_TOKEN)
})
