'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('subusers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: Sequelize.STRING,
      password: Sequelize.STRING,
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: 1,
        allowNull : false, 
      },
      parent_user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: false,
      },
      first_name: Sequelize.STRING,
      last_name: Sequelize.STRING,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull : false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull : false,
      }
    });
  },

  down: (queryInterface) => {
   return queryInterface.dropTable('subusers');
  }
};
