import Sequelize from 'sequelize'

export function getServersModel(sequelize) {
  return sequelize.define('Servers', {
    id: {
      type: Sequelize.STRING,
      unique: true,
      primaryKey: true
    },
    collection: Sequelize.STRING,
    network: {
      type: Sequelize.STRING
    },
    verifiedRole: Sequelize.STRING
  })
}