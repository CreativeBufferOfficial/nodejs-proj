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
    queryInterface.bulkInsert('users', [{
      email: 'client1@sample.com',
      password: '$2a$10$fpxNcGv2VE9P8nGx9hgJr..PcT06zv18GgFEwBaHEuIz4jphQmdA2', // this password is qqqqqq
      is_active: true,
    }], {});
    return queryInterface.bulkInsert('customer_details', [{
      company_uuid: '86899bc9-74b5-477a-b1f0-a690703c94b5',
      company_name: 'Sample Company',
      term_uuid: '86899bc9-74b5-477a-b1f0-a690703c9571',
      term_url: 'http://localhost:5000',
      contact_person: 'Sample User',
      address: 'Sample Address',
      contact_vat_tax_id: 'sample tax id',
      user_id: 1,
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
   queryInterface.bulkDelete('customer_details', null, {});
    return queryInterface.bulkDelete('users', null, {});
  }
};
