const express = require("express")
const path = require("path")
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))

// Lista dinâmica de conteúdos de matemática com links reais do YouTube
const listaDeAulas = [
    {
        titulo: "Função do 1º Grau (Introdução)",
        descricao: "Aprenda o conceito inicial de função afim, gráfico, coeficiente angular e linear.",
        link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ", 
        nivel: "Básico"
    },
    {
        titulo: "Equação do 2º Grau e Bhaskara",
        descricao: "Domine a fórmula de Bhaskara e aprenda a encontrar as raízes de uma equação quadrática.",
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

// Rota Principal (Início)
app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "index.html"))
})

// Rota de Videoaulas (Faz o link da barra lateral funcionar)
app.get("/videoaulas", (request, response) => {
    response.sendFile(path.join(__dirname, "index.html"))
})

// API que fornece os dados dos cards para o HTML
app.get("/api/aulas", (request, response) => {
    response.json(listaDeAulas)
})

app.listen(port, () => {
    console.log(`Serv local rodando na porta: ${port}`)
})

