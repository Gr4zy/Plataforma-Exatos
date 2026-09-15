const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const LessonStatus = require('./enums/LessonStatus');

class Lesson extends Model {}

Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'O título da aula é obrigatório.' } },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'A descrição da aula é obrigatória.' } },
    },
    video: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'O link do vídeo é obrigatório.' } },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(LessonStatus)),
      allowNull: false,
      defaultValue: LessonStatus.PUBLISHED,
    },
    excluido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Lesson',
    tableName: 'lessons',
    timestamps: true,
  }
);

module.exports = Lesson;
