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
    // Imagem opcional exibida junto ao enunciado da questão.
    image: {
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
