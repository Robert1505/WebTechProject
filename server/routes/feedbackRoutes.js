const express = require('express');
const app = express.Router();
const { authenticationMiddleware } = require('./loginMiddleware');

const { User, Activity, Feedback } = require('../sequelize');

// GET the list of all feedbacks of an activity if you are teacher, or only yours if you are student
app.get('/activity/:activityId', authenticationMiddleware, async (request, response, next) => {
    try {
        let user = await User.findByPk(request.userId)
        if (!user) response.status(404).json({ message: 'User not found!' })
        const activity = await Activity.findByPk(request.params.activityId);
        if (!activity) response.status(404).json({ message: 'Activity not found!' })

        if (user.type === 'teacher') {
            const feedbacks = await activity.getFeedbacks();
            response.status(200).json(feedbacks);
        } else {
            user = await User.findByPk(request.userId, {
                include: [{
                    model: Activity,
                    where: { id: activity.id },
                    include: [{
                        model: Feedback,
                        through: 'activities_feedback'
                    }]
                }]
            });
            if (user && user.activities && user.activities.length > 0) {
                const activity = user.activities[0];
                response.status(200).json(activity.feedbacks);
            } else {
                console.log("User or activity not found.");
            }
        }

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
                    if (u.type == 'student' && u.id == req.params.userId) {
                        if (req.body.type && req.body.date) {
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
            response.status(404).json({ message: 'User not found!' + user1.typeId + req.params.userId });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = app;