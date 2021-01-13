'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('unenrolled_cardlist', 'company_UUID', {
        type: Sequelize.STRING,
        after: "enrolled_status"
      });
      return Promise.resolve();
    } catch (_error) {
      console.log(_error, '_error_error');      
    }
  },
};
