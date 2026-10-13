import { Sequelize } from "sequelize";
import db from "../config/database.js";

const BadanPublik = db.define("BadanPublik", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nama_badan_publik: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  kategori: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
    validate: {
      isEmail: {
        args: true,
        msg: "Email tidak valid",
      },
    },
  },
  website: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  pertanyaan: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "belum dibalas",
  },
  thread_id: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  sent_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  monitoring_start_date: {
    type: Sequelize.DATEONLY,
    allowNull: true,
    defaultValue: null,
  },
  monitoring_status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "menunggu",
  },
  monitoring_extra_days: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  monitoring_responded_at: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
  },
  monitoring_closed_at: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: "BadanPublik",
});
export default BadanPublik;
