'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('transaction_status', 'three_ds_confirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      after: "transaction_status"
    });
  },
  
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('transaction_status', 'three_ds_confirmed');
  }

};
