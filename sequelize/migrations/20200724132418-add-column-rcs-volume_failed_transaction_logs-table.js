'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('volume_failed_transaction_logs', 'rc4', {
        type: Sequelize.DOUBLE(8,5),
        after: "transaction_volume"
      });

      await queryInterface.addColumn('volume_failed_transaction_logs', 'rc3', {
        type: Sequelize.DOUBLE(8,5),
        after: "transaction_volume"
      });

      await queryInterface.addColumn('volume_failed_transaction_logs', 'rc2', {
        type: Sequelize.DOUBLE(8,5),
        after: "transaction_volume"
      });

      await queryInterface.addColumn('volume_failed_transaction_logs', 'rc1', {
        type: Sequelize.DOUBLE(8,5),
        after: "transaction_volume"
      });
      return Promise.resolve();
    } catch (_error) {
      console.log(_error, '_error_error');      
    }
  },
};
