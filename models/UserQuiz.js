const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class UserQuiz extends Model {}

UserQuiz.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'UserQuiz',
    tableName: 'user_quizzes',
    timestamps: true,
  }
);

module.exports = UserQuiz;
