'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('customer_details', 'merchant_id', {
        type: Sequelize.INTEGER,
      });
      return Promise.resolve();
    } catch (_error) {
      console.log(_error, '_error_error');
    }
  },
};
