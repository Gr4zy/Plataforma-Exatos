// Como o projeto não usa migrations e o sync() do Sequelize não cria colunas
// novas em tabelas que já existem, este script garante (sem apagar dados)
// que as colunas de imagem existam em bancos criados por versões antigas.
const { DataTypes } = require('sequelize');
const { sequelize } = require('../models');

async function garantirColuna(tabela, coluna, definicao) {
  const qi = sequelize.getQueryInterface();
  const colunas = await qi.describeTable(tabela);
  if (!colunas[coluna]) {
    await qi.addColumn(tabela, coluna, definicao);
    console.log(`Coluna ${tabela}.${coluna} criada.`);
  }
}

async function ensureSchema() {
  await garantirColuna('questions', 'image', { type: DataTypes.STRING, allowNull: true });
  await garantirColuna('alternatives', 'image', { type: DataTypes.STRING, allowNull: true });
}

module.exports = ensureSchema;
