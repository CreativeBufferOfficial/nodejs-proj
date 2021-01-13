'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
   return queryInterface.bulkInsert('admin_account', [{
     username: 'admin@sample.com',
     password: '$2a$10$fpxNcGv2VE9P8nGx9hgJr..PcT06zv18GgFEwBaHEuIz4jphQmdA2', // this password is qqqqqq
     name: 'I am super admin',
   }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
   return queryInterface.bulkDelete('admin_account', null, {});
  }
};
