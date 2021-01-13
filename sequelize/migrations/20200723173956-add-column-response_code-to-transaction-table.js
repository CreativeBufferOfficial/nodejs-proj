'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('transaction', 'response_code', {
      type: Sequelize.STRING,
      after: "transaction_status"
    });
  },
};
