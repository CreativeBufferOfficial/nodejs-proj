'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('card_failed_transaction_logs', 'request_uuid', {
        type: Sequelize.STRING,
        after: "unenrolled_card_id"
      });
      return Promise.resolve();
    } catch (_error) {
      console.log(_error, '_error_error');      
    }
  },
};
