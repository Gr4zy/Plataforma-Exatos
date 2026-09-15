const { Sequelize } = require('sequelize');
require('dotenv').config();

// A Plataforma Exatos usa SQLite por padrão (simples para desenvolvimento e
// para o TCC), mas a mesma configuração permite trocar para MySQL/Postgres
// na infraestrutura do IFRN (RNF07) apenas alterando o .env, sem tocar no
// código dos models.
const dialect = process.env.DB_DIALECT || 'sqlite';

const sequelize = dialect === 'sqlite'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './database.sqlite',
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || undefined,
        dialect, // 'mysql' | 'postgres' | 'mariadb' ...
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
      }
    );

module.exports = sequelize;
