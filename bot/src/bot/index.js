import { Client, Intents, Collection } from 'discord.js'

import Commands from '../commands/index.js'
import { getUsersModel, getServersModel, getVerificationsModel } from '../models/index.js'

const bot = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES],
  partials: ['CHANNEL']
})

export function setUpBot(sequelize) {
  const Users = getUsersModel(sequelize)
  const Servers = getServersModel(sequelize)
  const Verifications = getVerificationsModel(sequelize)

  bot.commands = new Collection()
  Object.keys(Commands).map(key => {
    bot.commands.set(Commands[key].name, Commands[key]);
  })
  
  bot.on('ready', () => {
    Users.sync()
    Servers.sync()
    Verifications.sync()
    console.log(`Logged in as ${bot.user.tag}!`)
  })
  
  bot.on('messageCreate', (msg) => {
    if (msg.author.bot) return
    if (msg.channel.type === 'DM') return
  
    const args = msg.content.split(/ +/)
    const command = args.shift().toLowerCase()
    console.info(`Called command: ${command}`)
  
    if (!bot.commands.has(command)) return
  
    try {
      bot.commands.get(command).execute(msg, args, sequelize)
    } catch (error) {
      console.error(error)
      msg.reply('there was an error trying to execute that command!')
    }
  })
  
  bot.login(process.env.DISCORD_BOT_TOKEN)
}

export function getBot () {
  return bot
}