const sequelize = require("./config/database");
const Usuario = require("./models/usuario");
const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// ==========================================
// CONFIGURAÇÕES DO EXPRESS E HBS
// ==========================================

// Configura o motor de templates Handlebars (HBS)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos (CSS, imagens, etc.) da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares para capturar dados enviados por formulários (POST)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// DADOS DE EXEMPLO (VIDEOAULAS)
// ==========================================
const listaDeAulas = [
    {
        subtitulo: "Álgebra",
        titulo: "Função do 1º Grau (Introdução)",
        descricao: "Aprenda o conceito inicial de função afim, gráfico, coeficiente angular e linear.",
        link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
        nivel: "Básico"
    },
    {
        subtitulo: "Equações",
        titulo: "Equação do 2º Grau e Bhaskara",
        descricao: "Domine a fórmula de Bhaskara e aprenda a encontrar as raízes de uma equação quadrática.",
        link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
        nivel: "Intermediário"
    },
    {
        subtitulo: "Análise Combinatória",
        titulo: "Análise Combinatória: Fatorial",
        descricao: "Entenda os princípios de contagem, arranjo, combinação e agrupamentos matemáticos.",
        link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
        nivel: "Avançado"
    },
    {
        subtitulo: "Geometria Plana",
        titulo: "Geometria Plana: Áreas de Figuras",
        descricao: "Como calcular a área de quadrados, retângulos, triângulos e círculos sem mistérios.",
        link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
        nivel: "Básico"
    }
];

// ==========================================
// ROTAS GET (RENDERIZAÇÃO DE PÁGINAS HBS)
// ==========================================

// Página Inicial - renderiza index.hbs
app.get("/", (request, response) => {
    response.render("index");
});

// Rota antiga de videoaulas que também renderiza o index.hbs
app.get("/videoaulas", (request, response) => {
    response.render("index");
});

// Tela do Quiz - renderiza quizz.hbs
app.get("/quizz", (request, response) => {
    response.render("quizz");
});

// Tela de Cadastro - renderiza cadastro.hbs
app.get("/cadastro", (req, res) => {
    res.render("cadastro");
});

// Tela de Login - renderiza login.hbs
app.get("/login", (req, res) => {
    res.render("login");
});

// ==========================================
// ROTAS DE API E CRIAÇÃO MANUAL
// ==========================================

// Retorna as aulas em formato JSON
app.get("/api/aulas", (request, response) => {
    response.json(listaDeAulas);
});

// Criar usuário estático para teste rápido
app.get("/criar-usuario", async (req, res) => {
    try {
        await Usuario.create({
            nome: "Grazielly",
            email: "grazielly@gmail.com",
            senha: "123"
        });
        res.send("Usuário criado!");
    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro ao criar usuário estático.");
    }
});

// ==========================================
// ROTAS POST (PROCESSAMENTO DOS FORMULÁRIOS)
// ==========================================

// Processar o Login
app.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({
        where: {
            email,
            senha
        }
    });

    if (usuario) {
        res.redirect("/");
    } else {
        res.send("E-mail ou senha incorretos.");
    }
});

// Processar o Cadastro
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

// ==========================================
// CONEXÃO COM O BANCO E INICIALIZAÇÃO
// ==========================================
sequelize.sync()
    .then(() => {
        console.log("Banco sincronizado com sucesso! ");
    })
    .catch((erro) => {
        console.log("Erro ao sincronizar banco:", erro);
    });

app.listen(port, () => {
    console.log(`Servidor local rodando na porta: ${port} `);
});
