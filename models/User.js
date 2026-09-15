const { Model, DataTypes, ValidationError, ValidationErrorItem } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const UserProfile = require('./enums/UserProfile');

class User extends Model {
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }

  async validatePassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }

  static async findByEmail(email) {
    return await this.findOne({ where: { email } });
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Diagrama: "profile: int" - ver models/enums/UserProfile.js
    profile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: UserProfile.STUDENT,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O campo nome não pode ser vazio.' },
        len: { args: [2, 100], msg: 'O nome deve ter entre 2 e 100 caracteres.' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Este e-mail já está cadastrado.' }, // RN01 - {unique}
      validate: {
        isEmail: { msg: 'Informe um endereço de e-mail válido.' },
        notEmpty: { msg: 'O e-mail é obrigatório.' },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      // RN02 - senha de 6 a 8 caracteres. Validado manualmente no hook
      // beforeValidate (só quando o valor mudou), pois depois do hash o
      // campo passa a guardar o bcrypt (60 caracteres), e não o texto puro.
    },
    // RF07 - pontuação usada no ranking global
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // RF09 - exclusão lógica (o administrador "desativa" a conta, nunca a remove)
    excluido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      // RN02 - senha com no mínimo 6 caracteres. Validado sobre a senha em
      // texto puro, antes de virar hash.
      beforeValidate: (user) => {
        if (user.changed('password') && user.password) {
          if (user.password.length < 6) {
            throw new ValidationError('A senha deve ter no mínimo 6 caracteres.', [
              new ValidationErrorItem(
                'A senha deve ter no mínimo 6 caracteres.',
                'Validation error',
                'password',
                user.password
              ),
            ]);
          }
        }
      },
      // RF01 - senha sempre criptografada em bcrypt antes de salvar
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;
