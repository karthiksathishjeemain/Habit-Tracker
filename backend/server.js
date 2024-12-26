require('dotenv').config();
const express = require('express');
const cors = require('cors');
const habitRoutes = require('./routes/habit');
const userRoutes = require('./routes/user')
const authRoutes = require('./routes/auth')
const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/habits', habitRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth',authRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});