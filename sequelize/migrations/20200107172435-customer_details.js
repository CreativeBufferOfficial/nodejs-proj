'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.createTable('customer_details', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_uuid: Sequelize.STRING,
      term_uuid:  {
        type: Sequelize.STRING,
        defaultValue: 1,
        allowNull : false,
      },
      term_url:  {
        type: Sequelize.STRING,
        defaultValue: 1,
        allowNull : false,
      },
      company_name: Sequelize.STRING,
      contact_person: Sequelize.STRING,
      address: Sequelize.STRING,
      contact_vat_tax_id: Sequelize.STRING,
      ip_address: Sequelize.STRING,
      currency: Sequelize.STRING,
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull : false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: 1,
        allowNull : false,
      },
      amount_threshold: {
        type: Sequelize.FLOAT
      },
      is_kyc_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
      },
      callback_url: {
        type: Sequelize.STRING,
      },
      webhook_endpoint: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull : false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull : false,
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
   return queryInterface.dropTable('customer_details');
  }
};
