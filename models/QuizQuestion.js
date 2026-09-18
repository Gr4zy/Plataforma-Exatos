const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class QuizQuestion extends Model {}

QuizQuestion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'QuizQuestion',
    tableName: 'quiz_questions',
    timestamps: true,
  }
);

module.exports = QuizQuestion;
