'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('customer_details', 'fees', {
      type: Sequelize.DECIMAL(10,2),
      allowNull : false,
      after: "currency"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('customer_details', 'fees');
  }
};
