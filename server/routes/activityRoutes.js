const express = require('express');
const app = express.Router();
const { authenticationMiddleware } = require('./loginMiddleware');

const { User, Activity } = require('../sequelize');

// GET the list of activities.
app.get('/', async (request, response, next) => {
    try {
        const activities = await Activity.findAll();
        if (activities.length > 0) {
            response.json(activities);
        } else {
            response.sendStatus(204);
        }
    } catch (error) {
        next(error);
    }
});

// GET the list of activities posted by logged user
app.get('/users/:userId', authenticationMiddleware, async (req, response, next) => {
    try {
        if (req.type === 'teacher' && req.userId == req.params.userId) {
            const user = await User.findByPk(req.params.userId);
            if (user) {
                if (user.type == 'teacher') {
                    const activities = await user.getActivities();
                      response.status(200).json(activities);
                } else response.status(400).json({ message: 'User must be a professor!' });
            } else {
                response.status(404).json({ message: 'User not found!' });
            }
        }
        else response.status(403).json({ message: 'Your are not the professor!' })
    } catch (error) {
        next(error);
    }
});

// GET the list of enrolled activities of a student
app.get('/users/:userId/enrollment', authenticationMiddleware, async (req, response, next) => {
    try {
        if (req.type == 'student' && req.userId == req.params.userId) {
            console.log(req.params.userId + ' ' + req.userId)
            const user = await User.findByPk(req.params.userId);
            if (user) {
                if (user.type == 'student') {
                    const activities = await Activity.findAll({
                        include: [{
                            model: User,
                            where: { id: req.params.userId }
                        }]
                    })
                    if (activities.length > 0) {
                        response.json(activities);
                    } else {
                        response.sendStatus(204);
                    }
                } else response.status(400).json({ message: 'User must be a student!' });
            } else {
                response.status(404).json({ message: 'User not found!' });
            }
        }
        else response.status(403).json({ message: 'Your are not the student!'})
    } catch (error) {
        next(error);
    }
});
// GET an activity by id.
app.get('/:activityId', async (request, response, next) => {
    try {
        const activity = await Activity.findByPk(request.params.activityId);
        if (activity) {
            response.json(activity);
        } else {
            response.sendStatus(404);
        }
    } catch (error) {
        next(error);
    }
});

// POST a new activity made by a professor.
app.post('/:userId', authenticationMiddleware, async (req, response, next) => {
    try {
        console.log(req)
        if (req.type == 'teacher' && req.userId == req.params.userId) {
            const user = await User.findByPk(req.params.userId);
            if (user) {
                if (user.type == 'teacher') {
                    if (req.body.description &&req.body.title && req.body.code && req.body.date) {
                        const par = {
                            description: req.body.description,
                            title: req.body.title,
                            code: req.body.code,
                            date: new Date(req.body.date),
                            teacher: req.params.userId
                        };
                        const activity = await Activity.create(par);
                        user.addActivity(activity);
                        response.status(201).json({ message: 'Activity Created!' });
                    }
                    else response.status(400).json({ message: 'Malformed request!' });
                } else response.status(400).json({ message: 'User must be a professor!' });
            } else {
                response.status(404).json({ message: 'User not found!' });
            }
        }
        else response.status(403).json({ message: 'Your are not the professor!' })
    } catch (error) {
        next(error);
    }
});

// PUT to update an activity.
app.put('/:activityId', authenticationMiddleware, async (request, response, next) => {
    try {
        if (request.type == 'teacher') {
            const activity = await Activity.findByPk(request.params.activityId);
            if (activity && activity.teacher == request.userId) {
                if (request.body.description && req.body.title &&request.body.code && request.body.date) {
                    const par = {
                        description: req.body.description,
                        title: req.body.title,
                        code: req.body.code,
                        date: new Date(req.body.date),
                        teacher: req.params.userId
                    };
                    await activity.update(par);
                } else response.status(400).json({ message: 'Malformed request!' });
            } else {
                response.sendStatus(404);
            }
        }
        else response.status(403).json({ message: 'Your are not the professor!' })
    } catch (error) {
        next(error);
    }
});

// DELETE an activity.
app.delete('/:activityId', authenticationMiddleware, async (request, response, next) => {
    try {
        if (request.type == 'teacher') {
            const activity = await Activity.findByPk(request.params.activityId);
            if (activity) {
                if (activity.teacher == request.userId) {
                    await activity.destroy();
                    response.status(200).json({ message: "Deleted!" });
                } else {
                    response.status(404).json({ message: 'Your are not the professor!' + request.userId + activity.teacher })
                }
            }
            else {
                response.status(404).json({ message: 'Activity not found!' })
            }
        }
        else response.status(403).json({ message: 'Your are not the professor!' })
    } catch (error) {
        next(error);
    }
});

module.exports = app; 