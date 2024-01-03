const express = require('express');
const cors = require('cors');
const app = express();
const usersRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use(express.json({ limit: '20mb' }));
app.use(cors({ origin: 'http://localhost:3000' }));
const port = Number.parseInt(process.env.PORT) || 3001;

app.use('/users', usersRoutes);
app.use('/activities', activityRoutes);
app.use('/feedbacks', feedbackRoutes);

// pentru toate erorile ce pot aparea
app.use((req, res) => {
    res.status(404);
    res.send('404: Request Not Implemented');
});

app.listen(port, () => console.log(`Server up on port ${port}...`));