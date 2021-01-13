'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('transaction', 'event_result', {
      type: Sequelize.STRING,
      allowNull : false,
      after: "transaction_status"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('transaction', 'event_result');
  }
};
