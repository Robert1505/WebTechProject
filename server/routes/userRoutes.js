const express = require('express');
const bcrypt = require('bcrypt');
const app = express.Router();
const { encodeToken, authenticationMiddleware } = require('./loginMiddleware');

const { User, Activity } = require('../sequelize');
const { Op } = require('sequelize');

app.post('/login', async (req, res, next) => {
    const params = req.body.userName;
    const pass = req.body.password;
    if (params && pass) {
        try {
            const user = await User.findOne({ where: { userName: params } });
            if (user) {
                if (await bcrypt.compare(pass, user.password)) {
                    res.status(200).json({
                        message: 'Success',
                        token: encodeToken({ userId: user.id, type: user.type , user}), user
                    });
                } else {
                    res.status(403).json({ error: 'The password is incorrect' });
                }
            } else res.status(404).json({ error: 'User not found' });
        } catch (err) {
            console.error(err)
            next(err);
        }
    } else {
        res.status(400).json({ message: 'Malformed request!' });
    }
}); 

app.get('/logged', authenticationMiddleware, async (req, res) => {
    if (req.userId) {
        const user = await User.findByPk(req.userId);
        if (user) {
            const data = { ...user };
            delete data.password;
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } else {
        res.status(400).json({ message: 'Malformed request!' });
    }
});

// GET all the users from the database.
app.get('/', async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

// POST a new user to the database.
app.post('/', async (req, res, next) => {
    try {
        if (req.body.lastName && req.body.firstName && req.body.userName && req.body.password && req.body.type) {
            const hashedPassword = await bcrypt.hash(
                req.body.password,
                Number.parseInt(process.env.NUMBER_OF_SALTS)
            );
            const par = {
                id: req.body.id,
                lastName: req.body.lastName,
                firstName: req.body.firstName,
                userName: req.body.userName,
                password: hashedPassword,
                type: req.body.type
            };
            const user = await User.create(par);
            res.status(201).json({ message: 'User Created!' , user});

        } else {
            res.status(400).json({ message: 'Malformed request!' });
        }
    } catch (err) {
        next(err);
    }
});

// GET an user by id.
app.get('/:userId', async (request, response, next) => {
    try {
        const user = await User.findByPk(request.params.userId);
        if (user) {
            response.json(user);
        } else {
            response.status(404).json({ message: 'User Not Found!' })
        }
    } catch (error) {
        next(error);
    }
});

// DELETE an user by id.
app.delete('/:userId', async (request, response, next) => {
    try {
        const user = await User.findByPk(request.params.userId);
        if (user) {
            await user.destroy();
            response.status(204).json({ message: 'User Deleted!' })
        } else {
            response.status(404).json({ message: 'User Not Found!' })
        }
    } catch (error) {
        next(error);
    }
});

// UPDATE an user by id.
app.put('/:userId', async (req, response, next) => {
    try {
        const user = await User.findByPk(req.params.userId);
        if (user) {
            if (req.body.lastName && req.body.firstName && req.body.userName && req.body.password && req.body.type) {
                const hashedPassword = await bcrypt.hash(
                    req.body.password,
                    Number.parseInt(process.env.NUMBER_OF_SALTS)
                );
                const par = {
                    id: req.body.id,
                    lastName: req.body.lastName,
                    firstName: req.body.firstName,
                    userName: req.body.userName,
                    password: hashedPassword,
                    type: req.body.type
                };
                await user.update(par);
                response.status(201).json({ message: 'User Updated!' })

            }
        } else {
            response.status(404).json({ message: 'User Not Found!' })
        }
    } catch (error) {
        next(error);
    }
});

// POST a new user into an activity -> enroll.
app.post('/:userId/enroll', async (request, response, next) => {
    try {
        const code = request.body.code;
        if(!code) return response.status(404).json({message : "No code provided."});
        const user = await User.findByPk(request.params.userId);
        const activity = await Activity.findOne({where: {code, date: {
            [Op.gt]: new Date() // Find activities with datetime greater than the current moment
        }}});
        if (user && activity) {
            if (user.type === 'student') {
                activity.addUser(user);
                await activity.save();
                response.status(201).json({ message: 'Enrollement is done!' });
            } else response.status(400).json({ message: 'Only a student can be enrolled!' });
        } else {
            return response.status(404).json({message : "Activity does not exist or it is expired."});
        }
    } catch (error) {
        next(error);
    }
}
);

module.exports = app;