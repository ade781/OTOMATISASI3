const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AssignmentHistory = sequelize.define(
    'AssignmentHistory',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      badan_publik_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      actor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'AssignmentHistories'
    }
  );

  return AssignmentHistory;
};
