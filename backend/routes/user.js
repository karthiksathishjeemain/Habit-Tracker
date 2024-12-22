const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [user] = await db.execute(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id;

        await db.execute(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});
module.exports = router