const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Substitui os antigos campos fixos alternative_1/2/3 do Question: cada
// alternativa de uma pergunta agora é uma linha própria, então uma pergunta
// pode ter quantas alternativas forem necessárias (não apenas 3), e cada uma
// pode opcionalmente ter sua própria imagem.
class Alternative extends Model {}

Alternative.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    questionId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'O texto da alternativa é obrigatório.' } },
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Alternative',
    tableName: 'alternatives',
    timestamps: true,
  }
);

module.exports = Alternative;
