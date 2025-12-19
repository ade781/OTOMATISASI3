import { Sequelize } from 'sequelize';
import db from '../config/database.js';

const UjiAksesQuestion = db.define(
  'UjiAksesQuestion',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    section: {
      type: Sequelize.STRING,
      allowNull: true
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'UjiAksesQuestions'
  }
);

export default UjiAksesQuestion;
