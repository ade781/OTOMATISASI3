const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define(
    'Message',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'Messages'
    }
  );

  return Message;
};
