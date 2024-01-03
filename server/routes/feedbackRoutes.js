const express = require('express');
const app = express.Router();
const { authenticationMiddleware } = require('./loginMiddleware');

const { User, Activity, Feedback } = require('../sequelize');

// GET the list of feedbacks, only if you are professor.
app.get('/all', authenticationMiddleware, async (request, response, next) => {
    try {
        if (request.userType == 'teacher') {
            const activities = await Activity.findAll({ where: { creator: request.userId } });
            const activity = activities.shift();
            const feedbacks = await activity.getFeedbacks();
            if (feedbacks.length > 0) {
                response.json(feedbacks);
            } else {
                response.sendStatus(204);
            }
        }
        else response.status(403).json({ message: 'Your are not the professor!' })
    } catch (error) {
        next(error);
    }
});

// GET the list of feedbacks of an activity, only if you are professor.
app.get('/activity/:activityId', authenticationMiddleware, async (request, response, next) => {
    try {
        if (request.userType == 'teacher') {
            const activity = await Activity.findByPk(request.params.activityId);
            const feedbacks = await activity.getFeedbacks();
            if (feedbacks.length > 0) {
                response.json(feedbacks);
            } else {
                response.sendStatus(204);
            }
        }
        else response.status(403).json({ message: 'Your are not the professor!' })
    } catch (error) {
        next(error);
    }
});

// GET the list of feedbacks sent by you if you are a student.
app.get('', authenticationMiddleware, async (request, response, next) => {
    try {
        if (request.userType == 'student') {
            const user = await User.findByPk(request.userId)
            if (user) {
                const feedbacks = await user.getFeedbacks();
                if (feedbacks.length > 0) {
                    response.json(feedbacks);
                } else {
                    response.sendStatus(204);
                }
            } else response.status(404).json({ message: 'User not found!' })
        }
        else response.status(403).json({ message: 'Your are not the user!' })
    } catch (error) {
        next(error);
    }
});

// GET a feedback by id.
app.get('/:feedbackId', authenticationMiddleware, async (request, response, next) => {
    try {
        if (request.userType == 'teacher') {
            const feedback = await Feedback.findByPk(request.params.feedbackId);
            if (feedback) {
                response.json(feedback);
            } else {
                response.status(404).json({ message: 'Feedback Not Found!' })
            }
        }
        else response.status(403).json({ message: 'Your are not the professor!' })
    } catch (error) {
        next(error);
    }
});

// POST a new feedback made by a user at an activity.
app.post('/users/:userId/activities/:activityId', authenticationMiddleware, async (req, response, next) => {
    try {
        const user1 = await User.findByPk(req.params.userId);
        if (user1) {
            const activity = await Activity.findByPk(req.params.activityId);
            if (activity) {
                const users = await activity.getUsers();
                for (let u of users) {
                    if (u.usertypeId == 1 && u.id == req.params.userId) {
                        if (req.body.description && req.body.type && req.body.date) {
                            const feedback = await Feedback.create(req.body);
                            activity.addFeedback(feedback);
                            await activity.save();
                            user1.addFeedback(feedback);
                            await user1.save();
                            response.status(201).json({ message: 'Feedback Created!' });
                        }
                        else response.status(400).json({ message: 'Malformed request!' });
                    }
                }
                response.status(404).json({ message: 'Student is not enrolled at such activity!' });
            } else response.status(404).json({ message: 'Student is not enrolled at such activity!' });
        } else {
            response.status(404).json({ message: 'User not found!' + user1.usertypeId + req.params.userId });
        }
    } catch (error) {
        next(error);
    }
});

// PUT to update a feedback.
app.put('/:feedbackId', authenticationMiddleware, async (request, response, next) => {
    try {
        if (request.userType == 'student') {
            const feedback = await Feedback.findByPk(request.params.feedbackId);
            if (feedback) {
                if (request.body.description && request.body.type && request.body.date) {
                    await feedback.update(request.body);
                } else response.status(400).json({ message: 'Malformed request!' });
            } else {
                response.sendStatus(404);
            }
        } else response.status(403).json({ message: 'Your are not the student!' })
    } catch (error) {
        next(error);
    }
});

// DELETE a feedback.
app.delete('/:feedbackId', async (request, response, next) => {
    try {
        const feedback = await Feedback.findByPk(request.params.feedbackId);
        if (feedback) {
            await feedback.destroy();
        } else {
            response.sendStatus(404);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = app;