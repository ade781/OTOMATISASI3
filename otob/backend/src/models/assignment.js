const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Assignment = sequelize.define(
    'Assignment',
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
      }
    },
    {
      tableName: 'Assignments',
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'badan_publik_id']
        },
        // Index bantu untuk pencarian tapi tidak memaksa unik (data lama bisa duplikat)
        { fields: ['badan_publik_id'] }
      ]
    }
  );

  return Assignment;
};
