const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QuotaRequest = sequelize.define(
    'QuotaRequest',
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
      requested_quota: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      admin_note: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      response_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: 'QuotaRequests'
    }
  );

  return QuotaRequest;
};
