import Sequelize from 'sequelize'

export function getUsersModel(sequelize) {
  return sequelize.define('users', {
    discordId: {
      type: Sequelize.STRING,
      unique: true
    },
    solanaAddress: {
      type: Sequelize.STRING,
      unique: true
    },
    signature: {
      type: Sequelize.STRING,
      unique: true
    }
  })
}