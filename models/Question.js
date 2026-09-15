const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Question extends Model {}

Question.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    statement: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'Toda pergunta precisa de um enunciado.' } },
    },
    correct: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['alternative_1', 'alternative_2', 'alternative_3']] },
    },
    alternative_1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alternative_2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alternative_3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
  },
  {
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
    timestamps: true,
  }
);

module.exports = Question;
