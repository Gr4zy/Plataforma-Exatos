const sequelize = require("./config/database");
const Usuario = require ("./models/usuario")
const express = require("express")
const path = require("path")
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))

const listaDeAulas = [
    {
        titulo: "Função do 1º Grau (Introdução)",
        descricao: "Aprenda o conceito inicial de função afim, gráfico, coeficiente angular e linear.",
        link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ", 
        nivel: "Básico"
    },
    {
        titulo: "Equação do 2º Grau e Bhaskara",
        descricao: "Domine a fórmula de Bhaskara e aprenda a encontrar as raíces de uma equação quadrática.",
        link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
        nivel: "Intermediário"
    },
    {
        titulo: "Análise Combinatória: Fatorial",
        descricao: "Entenda os princípios de contagem, arranjo, combinação e agrupamentos matemáticos.",
        link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
        nivel: "Avançado"
    },
    {
        titulo: "Geometria Plana: Áreas de Figuras",
        descricao: "Como calcular a área de quadrados, retângulos, triângulos e círculos sem mistérios.",
        link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
        nivel: "Básico"
    }
]

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "index.html"))
})

app.get("/videoaulas", (request, response) => {
    response.sendFile(path.join(__dirname, "index.html"))
})

app.get("/api/aulas", (request, response) => {
    response.json(listaDeAulas)
})

sequelize.sync()
.then(() => {

    console.log("Banco sincronizado.");

})
.catch((erro)=>{

    console.log(erro);

});

app.get("/criar-usuario", async (req,res)=>{

    await Usuario.create({

        nome:"Grazielly",

        email:"grazielly@gmail.com",

        senha:"123"

    });

    res.send("Usuário criado!");

});

app.get("/cadastro", (req, res) => {
    res.sendFile(path.join(__dirname, "cadastro.html"));
});

app.listen(port, () => {
    console.log(`Servidor local rodando na porta: ${port}`)
})

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html");
}); 

app.use(express.urlencoded({ extended: true }));

app.post("/login", async (req,res)=>{

    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({

        where:{

            email,

            senha

        }

    });

    if(usuario){

        res.redirect("/");

    }else{

        res.send("E-mail ou senha incorretos.");

    }

});

app.post("/cadastro", async (req, res) => {

    const { nome, email, senha } = req.body;

    try {

        await Usuario.create({
            nome,
            email,
            senha
        });

        res.redirect("/login");

    } catch (erro) {

        console.error(erro);
        res.send("Erro ao cadastrar usuário.");

    }

});