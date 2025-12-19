import { Sequelize } from 'sequelize';
import db from '../config/database.js';

const UjiAksesOption = db.define(
  'UjiAksesOption',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    question_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    key: {
      type: Sequelize.STRING,
      allowNull: false
    },
    label: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'UjiAksesOptions'
  }
);

export default UjiAksesOption;
