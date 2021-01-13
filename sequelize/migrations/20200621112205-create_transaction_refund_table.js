module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('payment_transaction_refunds', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      adax_uuid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      request_uuid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DOUBLE(10, 2),
        allowNull: false
      },
      refund_status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      response_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_cof_roc: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
      }
      // first_name: {
      //   type: Sequelize.STRING(100),
      //   allowNull: false
      // },
      // last_name: {
      //   type: Sequelize.STRING(100),
      //   allowNull: false
      // },
      // email: {
      //   type: Sequelize.STRING,
      //   allowNull: false
      // },
      // address_ip: {
      //   type: Sequelize.STRING(100),
      //   allowNull: false
      // },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('transaction_refunds');
  }
};
