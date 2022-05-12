import 'dotenv/config'
import Sequelize from 'sequelize'

import { setUpServer } from './server/index.js'
import { setUpBot } from './bot/index.js'

const sequelize = new Sequelize('solanadaoverify', process.env.SQLITE_USER, process.env.SQLITE_PASSWORD, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'solanadaoverify.sqlite',
})

setUpBot(sequelize)
setUpServer(sequelize)
