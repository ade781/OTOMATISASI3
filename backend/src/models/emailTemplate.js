import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const EmailTemplate = db.define(
  'EmailTemplate',
  {
    id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subject: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'email_templates',
    timestamps: true,
    underscored: true,
  }
);

export default EmailTemplate;
