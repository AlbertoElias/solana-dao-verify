import Sequelize from 'sequelize'

export function getVerificationsModel(sequelize) {
  return sequelize.define('verifications', {
    solanaAddress: {
      type: Sequelize.STRING
    },
    serverId: {
      type: Sequelize.STRING
    }
  })
}