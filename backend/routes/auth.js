const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

     
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length) {
            return res.status(400).json({ message: 'User already exists' });
        }

  
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;


        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (!user.length) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

 
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

      
        const token = jwt.sign({ id: user[0].id, name: user[0].name, email: user[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

module.exports = router;