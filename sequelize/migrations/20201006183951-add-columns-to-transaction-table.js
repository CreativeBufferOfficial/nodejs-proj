'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('transaction', 'kyc_delayed', {
        type: Sequelize.BOOLEAN,
        after: "refund_status"
      });
      await queryInterface.addColumn('transaction', 'crypto_transfer', {
        type: Sequelize.BOOLEAN,
        after: "refund_status"
      });
      await queryInterface.addColumn('transaction', 'crypto_settled', {
        type: Sequelize.BOOLEAN,
        after: "refund_status"
      });
      return Promise.resolve();
    } catch (_error) {
      console.log(_error, '_error_error');
    }
  },
};
