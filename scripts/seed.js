const { User, Lesson, Quiz, Question, QuizQuestion } = require('../models');
const LessonStatus = require('../models/enums/LessonStatus');
const UserProfile = require('../models/enums/UserProfile');

async function seed() {
  const totalUsuarios = await User.count();

  if (totalUsuarios === 0) {
    console.log('Semeando banco de dados inicial...');

    await User.create({
      name: 'Administrador Exatos',
      email: 'admin@exatos.ifrn.edu.br',
      password: 'admin12',
      profile: UserProfile.ADMIN,
    });

    await User.create({
      name: 'Bolsista PIBID',
      email: 'bolsista@exatos.ifrn.edu.br',
      password: 'pibid12',
      profile: UserProfile.SCHOLAR,
    });

    await User.create({
      name: 'Aluno Exemplo',
      email: 'aluno@exatos.ifrn.edu.br',
      password: 'aluno12',
      profile: UserProfile.STUDENT,
    });

    const aulasSeed = [
      {
        title: 'Função do 1º Grau (Introdução)',
        description: 'Aprenda o conceito inicial de função afim, gráfico, coeficiente angular e linear.',
        video: 'https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ',
      },
      {
        title: 'Equação do 2º Grau e Bhaskara',
        description: 'Domine a fórmula de Bhaskara e aprenda a encontrar as raízes de uma equação quadrática.',
        video: 'https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ',
      },
      {
        title: 'Análise Combinatória: Fatorial',
        description: 'Entenda os princípios de contagem, arranjo, combinação e agrupamentos matemáticos.',
        video: 'https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ',
      },
      {
        title: 'Geometria Plana: Áreas de Figuras',
        description: 'Como calcular a área de quadrados, retângulos, triângulos e círculos sem mistérios.',
        video: 'https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ',
      },
    ];

    const aulasCriadas = [];
    for (const dadosAula of aulasSeed) {
      const aula = await Lesson.create({ ...dadosAula, status: LessonStatus.PUBLISHED });
      aulasCriadas.push(aula);
    }

    const quiz = await Quiz.create({
      title: 'Quiz - Função do 1º Grau',
      category: 'Álgebra',
      level: 0,
      lessonId: aulasCriadas[0].id,
    });

    const pergunta1 = await Question.create({
      statement: 'Qual é a raiz da função f(x) = 2x - 6?',
      alternative_1: 'x = -3',
      alternative_2: 'x = 3',
      alternative_3: 'x = 6',
      correct: 'alternative_2',
      explanation: 'A raiz é o valor de x que torna f(x) = 0. Fazendo 2x - 6 = 0, temos 2x = 6, logo x = 3.',
    });
    await QuizQuestion.create({ quizId: quiz.id, questionId: pergunta1.id, order: 0 });

    const pergunta2 = await Question.create({
      statement: 'Qual é o coeficiente angular da função f(x) = 3x + 4?',
      alternative_1: '4',
      alternative_2: '3',
      alternative_3: '-3',
      correct: 'alternative_2',
      explanation: 'Numa função do 1º grau f(x) = ax + b, o coeficiente angular é o valor de a. Aqui a = 3.',
    });
    await QuizQuestion.create({ quizId: quiz.id, questionId: pergunta2.id, order: 1 });

    console.log('Banco de dados semeado com sucesso!');
    console.log('Login admin: admin@exatos.ifrn.edu.br / admin12');
    console.log('Login bolsista: bolsista@exatos.ifrn.edu.br / pibid12');
    console.log('Login aluno: aluno@exatos.ifrn.edu.br / aluno12');
  }
}

module.exports = seed;
