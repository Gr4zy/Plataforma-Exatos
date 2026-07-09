const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("plataforma_exatos", "root", "root", {
    host: "localhost",
    dialect: "mysql",
    logging: console.log
});

sequelize.authenticate()
    .then(() => {
        console.log("Conexão com o banco realizada com sucesso!");
    })
    .catch((erro) => {
        console.error("Erro ao conectar ao banco:");
        console.error(erro);
    });

module.exports = sequelize;