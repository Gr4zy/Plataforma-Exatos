const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Attachment extends Model {}

Attachment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Material',
    },
    file: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'O arquivo/URL do anexo é obrigatório.' } },
    },
  },
  {
    sequelize,
    modelName: 'Attachment',
    tableName: 'attachments',
    timestamps: true,
  }
);

module.exports = Attachment;
