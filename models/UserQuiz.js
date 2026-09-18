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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    // Marca quando todas as questões já foram respondidas, para garantir
    // que os pontos só sejam somados ao usuário uma única vez.
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'UserQuiz',
    tableName: 'user_quizzes',
    timestamps: true,
    indexes: [
      // Uma única tentativa (registro de progresso) por usuário/quiz.
      { unique: true, fields: ['userId', 'quizId'] },
    ],
  }
);

module.exports = UserQuiz;
