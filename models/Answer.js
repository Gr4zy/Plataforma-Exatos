const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Representa a resposta que um usuário deu a uma questão dentro de uma
// tentativa de quiz (UserQuiz). Uma vez criada, nunca é alterada/apagada -
// é isso que garante que o aluno não possa "voltar atrás" e trocar a
// resposta depois de respondida (RF06 - progresso do quiz).
class Answer extends Model {}

Answer.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    userQuizId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    // Texto da alternativa escolhida, guardado "congelado" no momento da
    // resposta (mesmo que a pergunta seja editada depois).
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    // Referência à alternativa escolhida (além do texto acima, guardado à
    // parte para não depender de a alternativa continuar existindo).
    alternativeId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Answer',
    tableName: 'answers',
    timestamps: true,
    indexes: [
      // Uma única resposta por questão dentro de cada tentativa.
      { unique: true, fields: ['userQuizId', 'questionId'] },
    ],
  }
);

module.exports = Answer;
