// O diagrama de classes define User.profile como "int". Como um inteiro puro
// não é autoexplicativo no código, mapeamos aqui os valores possíveis.
const UserProfile = Object.freeze({
  STUDENT: 0, // aluno
  SCHOLAR: 1, // bolsista
  ADMIN: 2, // administrador
});

module.exports = UserProfile;
