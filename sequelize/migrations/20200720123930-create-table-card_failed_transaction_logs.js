'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.createTable('card_failed_transaction_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_email: Sequelize.STRING,
      card_number: Sequelize.STRING,
      attempts: Sequelize.INTEGER,
      status: Sequelize.INTEGER,
      latest_alert_sent: Sequelize.STRING,
      status: Sequelize.BOOLEAN,
      is_read: Sequelize.BOOLEAN,
      unenrolled_card_id: Sequelize.INTEGER,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull : false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull : false,
      }
    });
  },
};
