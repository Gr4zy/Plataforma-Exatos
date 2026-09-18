// Ponto único que registra todas as associações do diagrama de classes da
// Plataforma Exatos e reexporta os models já relacionados entre si.
const sequelize = require('../config/database');

const User = require('./User');
const Lesson = require('./Lesson');
const Attachment = require('./Attachment');
const Quiz = require('./Quiz');
const Question = require('./Question');
const QuizQuestion = require('./QuizQuestion');
const Alternative = require('./Alternative');
const UserLesson = require('./UserLesson');
const UserQuiz = require('./UserQuiz');
const Answer = require('./Answer');

const LessonStatus = require('./enums/LessonStatus');
const UserProfile = require('./enums/UserProfile');

Lesson.hasMany(Attachment, { as: 'attachments', foreignKey: 'lessonId', onDelete: 'CASCADE' });
Attachment.belongsTo(Lesson, { foreignKey: 'lessonId' });

Lesson.hasMany(Quiz, { as: 'quizzes', foreignKey: 'lessonId' });
Quiz.belongsTo(Lesson, { as: 'lesson', foreignKey: 'lessonId' });

Quiz.hasMany(QuizQuestion, { as: 'quizQuestions', foreignKey: 'quizId', onDelete: 'CASCADE' });
QuizQuestion.belongsTo(Quiz, { as: 'quiz', foreignKey: 'quizId' });

Question.hasMany(QuizQuestion, { as: 'quizQuestions', foreignKey: 'questionId', onDelete: 'CASCADE' });
QuizQuestion.belongsTo(Question, { as: 'question', foreignKey: 'questionId' });

Quiz.belongsToMany(Question, { through: QuizQuestion, as: 'questions', foreignKey: 'quizId', otherKey: 'questionId' });
Question.belongsToMany(Quiz, { through: QuizQuestion, as: 'quizzes', foreignKey: 'questionId', otherKey: 'quizId' });

// Cada pergunta pode ter quantas alternativas forem necessárias (não mais
// limitada a 3), e cada alternativa pode ter sua própria imagem.
Question.hasMany(Alternative, { as: 'alternatives', foreignKey: 'questionId', onDelete: 'CASCADE' });
Alternative.belongsTo(Question, { as: 'question', foreignKey: 'questionId' });

User.hasMany(UserLesson, { as: 'lessonProgress', foreignKey: 'userId', onDelete: 'CASCADE' });
UserLesson.belongsTo(User, { foreignKey: 'userId' });

Lesson.hasMany(UserLesson, { as: 'userProgress', foreignKey: 'lessonId', onDelete: 'CASCADE' });
UserLesson.belongsTo(Lesson, { foreignKey: 'lessonId' });

User.hasMany(UserQuiz, { as: 'quizAttempts', foreignKey: 'userId', onDelete: 'CASCADE' });
UserQuiz.belongsTo(User, { foreignKey: 'userId' });

Quiz.hasMany(UserQuiz, { as: 'attempts', foreignKey: 'quizId', onDelete: 'CASCADE' });
UserQuiz.belongsTo(Quiz, { foreignKey: 'quizId' });

UserQuiz.hasMany(Answer, { as: 'answers', foreignKey: 'userQuizId', onDelete: 'CASCADE' });
Answer.belongsTo(UserQuiz, { as: 'userQuiz', foreignKey: 'userQuizId' });

Question.hasMany(Answer, { as: 'answers', foreignKey: 'questionId' });
Answer.belongsTo(Question, { as: 'question', foreignKey: 'questionId' });

Alternative.hasMany(Answer, { as: 'chosenIn', foreignKey: 'alternativeId' });
Answer.belongsTo(Alternative, { as: 'alternative', foreignKey: 'alternativeId' });

module.exports = {
  sequelize,
  User,
  Lesson,
  Attachment,
  Quiz,
  Question,
  QuizQuestion,
  Alternative,
  UserLesson,
  UserQuiz,
  Answer,
  LessonStatus,
  UserProfile,
};
