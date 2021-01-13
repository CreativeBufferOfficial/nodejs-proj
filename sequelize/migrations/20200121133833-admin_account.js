'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.createTable('admin_accounts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull : false, 
      },
      password: {
        type: Sequelize.STRING,
        allowNull : false, 
      },
      name: {
        type: Sequelize.STRING,
        allowNull : false, 
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: 1,
        allowNull : false, 
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: 1,
        allowNull : false, 
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull : false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull : false,
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('admin_accounts');
    */
   return queryInterface.dropTable('admin_accounts');
  }
};
