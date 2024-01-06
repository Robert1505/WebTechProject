const { Sequelize } = require('sequelize');
const DataTypes = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './feedback.db',
    define: {
        timestamps: false
    }
});

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
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
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
        isIn: ['student', 'teacher']
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: true, }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true
    }
});

const Feedback = sequelize.define('feedback', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        notEmpty: true
    }
});

const Activity = sequelize.define('activity', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
        unique: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        notEmpty: true
    }
});

User.hasMany(Feedback);
User.hasMany(Activity, {foreignKey: 'teacher'});
Activity.belongsToMany(User,{ through: 'student_enrollements'});// many to many
User.belongsToMany(Activity, {through: 'student_enrollements'});
Activity.belongsToMany(Feedback,{ through: 'activities_feedback'});
Feedback.belongsToMany(Activity,{ through: 'activities_feedback'});

sequelize.authenticate()
    .then(() => {
        console.log("Connected!")
    })
    .catch(err => console.log("Error connecting: " + err));

sequelize
    .sync({ force: false, alter: false })
    .then(() => { console.log("Database synced"); })
    .catch(err => console.log("Error syncing database:" + err));

module.exports = { User, Activity, Feedback };