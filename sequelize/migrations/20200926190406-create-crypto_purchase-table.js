'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('crypto_purchase', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      request_uuid: {
        type: Sequelize.UUID,
      },
      email: {
        type: Sequelize.STRING,
      },
      company_uuid: {
        type: Sequelize.UUID,
      },
      quote_price: {
        type: Sequelize.DOUBLE(14, 8),
        defaultValue: 0,
        allowNull: false,
      },
      original_purchased_price: {
        type: Sequelize.DOUBLE(14, 8),
        defaultValue: 0,
        allowNull: false,
      },
      markup_fee: {
        type: Sequelize.DOUBLE(14, 8),
        defaultValue: 0,
        allowNull: false,
      },
      markup_fee_percentage: {
        type: Sequelize.DOUBLE(14, 8),
        defaultValue: 0,
        allowNull: false,
      },
      final_price: {
        type: Sequelize.DOUBLE(14, 8),
        defaultValue: 0,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.DOUBLE(14, 8),
        defaultValue: 0,
        allowNull: false,
      },
      base_currency: {
        type: Sequelize.STRING,
      },
      quote_currency: {
        type: Sequelize.STRING,
      },
      proceeds_currency: {
        type: Sequelize.STRING,
      },
      wallet: {
        type: Sequelize.STRING,
      },
      requested_at: {
        type: Sequelize.DATE,
        // defaultValue: Sequelize.fn('now'),
        allowNull : false,
      },
      quoted_at: {
        type: Sequelize.DATE,
        // defaultValue: Sequelize.fn('now'),
        allowNull : false,
      },
      tx_id: {
        type: Sequelize.STRING,
      },
      transferred: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
        allowNull: false,
      },
      status: {
        type: Sequelize.TINYINT,
        defaultValue: 1,
        allowNull: false,
      },
      initial_transfer: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
        allowNull: false,
      },
      fully_settled_at: {
        type: Sequelize.DATE,
        // defaultValue: Sequelize.fn('now'),
        allowNull : true,
      },
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