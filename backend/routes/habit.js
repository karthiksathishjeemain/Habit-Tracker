const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');
const jwt = require('jsonwebtoken')
// Generate a JWT token
router.get('/token', (req, res) => {
    const user = {
        id: 1, // Example user ID
        name: 'John Doe', // Example user name
        email: 'john.doe@example.com' // Example user email
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7h' });

    res.json({ token });
});
// Create a new habit
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;

        const [result] = await db.execute(
            'INSERT INTO habits (user_id, title, description) VALUES (?, ?, ?)',
            [userId, title, description]
        );

        res.status(201).json({
            id: result.insertId,
            title,
            description,
            status: 'active'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating habit', error: error.message });
    }
});

// Get all habits for authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [habits] = await db.execute(
            'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching habits', error: error.message });
    }
});

// Update a habit
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const habitId = req.params.id;
        const userId = req.user.id;

        // Verify habit belongs to user
        const [habit] = await db.execute(
            'SELECT * FROM habits WHERE id = ? AND user_id = ?',
            [habitId, userId]
        );

        if (!habit.length) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        await db.execute(
            'UPDATE habits SET title = ?, description = ?, status = ? WHERE id = ?',
            [title, description, status, habitId]
        );

        res.json({ message: 'Habit updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating habit', error: error.message });
    }
});

// Delete a habit
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const habitId = req.params.id;
        const userId = req.user.id;

        const [result] = await db.execute(
            'DELETE FROM habits WHERE id = ? AND user_id = ?',
            [habitId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        res.json({ message: 'Habit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting habit', error: error.message });
    }
});

module.exports = router;