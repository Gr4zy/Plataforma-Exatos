const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class UserLesson extends Model {}

UserLesson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    video_progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'UserLesson',
    tableName: 'user_lessons',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'lessonId'] },
    ],
  }
);

module.exports = UserLesson;
