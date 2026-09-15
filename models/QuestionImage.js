const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class QuestionImage extends Model {}

QuestionImage.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'A imagem é obrigatória.' } },
    },
  },
  {
    sequelize,
    modelName: 'QuestionImage',
    tableName: 'question_images',
    timestamps: true,
  }
);

module.exports = QuestionImage;
