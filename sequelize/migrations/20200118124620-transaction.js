'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    return queryInterface.createTable('transaction', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      adax_uuid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customer_details_id: {
        type: Sequelize.INTEGER,
        references: { model: 'customer_details', key: 'id' },
        allowNull: false,
      },
      request_uuid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      merchant_uuid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address_ip: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      amount: {
        type: Sequelize.DOUBLE(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      card_number: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      expiry_date: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      cvc2: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      transaction_status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      auto_clear: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      cof_rof_initial_uuid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fees: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      refund_status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
      },
      updatedAt: {
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
    return queryInterface.dropTable('transaction');
  }
};
