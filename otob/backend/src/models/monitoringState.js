const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MonitoringState = sequelize.define(
    'MonitoringState',
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      badan_publik_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      extra_days: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: 'monitoring_states',
      underscored: true
    }
  );

  return MonitoringState;
};
