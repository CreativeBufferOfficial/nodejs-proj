'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.createTable('transaction_status', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        references: { model: 'transaction', key: 'id' },
        allowNull: false,
      },
      transaction_status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      clearing_amount: {
        type: Sequelize.STRING,
        allowNull: false
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
 
      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.dropTable('transaction_status');
  }
};
