const sequelize = require('../database/sequelize');
const  DataTypes  = require('sequelize');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },    
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true
    },
    userName:{
        type:DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true,notEmpty: true,  }
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true
    }
});

module.exports = {User};