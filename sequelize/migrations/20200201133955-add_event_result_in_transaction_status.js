'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('transaction_status', 'event_result', {
      type: Sequelize.STRING,
      allowNull : false,
      after: "transaction_status"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('transaction_status', 'event_result');
  }
};
