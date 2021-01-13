'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_details', 'send_report', {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      after: "user_id"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('customer_details', 'send_report');
  }
};
