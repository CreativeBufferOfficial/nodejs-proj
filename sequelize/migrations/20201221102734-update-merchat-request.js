'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('merchant_requests', 'signup_notification_sent', {
      type: Sequelize.ENUM,
      values: ['0', '1'],
      defaultValue: '0',
      after: "email"
    });

    await queryInterface.addColumn('merchant_requests', 'application_completed', {
      type: Sequelize.ENUM,
      values: ['0', '1'],
      defaultValue: '0',
      after: "signup_notification_sent"
    });

    await queryInterface.addColumn('merchant_requests', 'application_completion_date', {
      type: Sequelize.DATE,
      allowNull : true,
      after: "application_completed"
    });

    await queryInterface.addColumn('merchant_requests', 'merchant_approved', {
      type: Sequelize.ENUM,
      values: ['true', 'false'],
      defaultValue: 'false',
      after: "application_completion_date"
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
