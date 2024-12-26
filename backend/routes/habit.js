const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');
const jwt = require("jsonwebtoken")


router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, duration, startDate } = req.body;
        const userId = req.user.id;

        const [result] = await db.execute(
            'INSERT INTO habits (user_id, title, description, duration, start_date) VALUES (?, ?, ?, ?, ?)',
            [userId, title, description, duration, startDate]
        );

        res.status(201).json({
            id: result.insertId,
            title,
            description,
            duration,
            startDate,
            status: 'active'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating habit', error: error.message });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const [habits] = await db.execute(
            `SELECT h.*, 
                    DATE_FORMAT(h.start_date, "%Y-%m-%d") as formatted_start_date,
                    GROUP_CONCAT(
                        JSON_OBJECT(
                            'date', hp.date,
                            'status', hp.status
                        )
                    ) as progress
             FROM habits h
             LEFT JOIN habit_progress hp ON h.id = hp.habit_id
             WHERE h.user_id = ? AND h.status = 'active'
             GROUP BY h.id
             ORDER BY h.created_at DESC`,
            [req.user.id]
        );

     
        const habitsWithProgress = habits.map(habit => ({
            ...habit,
            progress: habit.progress ? JSON.parse(`[${habit.progress}]`) : []
        }));

        res.json(habitsWithProgress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching habits', error: error.message });
    }
});


router.post('/:id/progress', authenticateToken, async (req, res) => {
    try {
        const { date, status, notes } = req.body;
        const habitId = req.params.id;
        const userId = req.user.id;

 
        const [habit] = await db.execute(
            'SELECT * FROM habits WHERE id = ? AND user_id = ?',
            [habitId, userId]
        );

        if (!habit.length) {
            return res.status(404).json({ message: 'Habit not found' });
        }

 
        await db.execute(
            `INSERT INTO habit_progress (habit_id, date, status, notes)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             status = VALUES(status),
             notes = VALUES(notes)`,
            [habitId, date, status, notes]
        );

        res.json({ message: 'Progress updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating progress', error: error.message });
    }
});


router.get('/:id/progress', authenticateToken, async (req, res) => {
    try {
        const habitId = req.params.id;
        const userId = req.user.id;
        console.log ("Habit id ", habitId)
        console.log("user id", userId)
   
        const [habit] = await db.execute(
            'SELECT * FROM habits WHERE id = ? AND user_id = ?',
            [habitId, userId]
        );

        if (!habit.length) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        // const [progress] = await db.execute(
        //     'SELECT date, status, notes FROM habit_progress WHERE habit_id = ? ORDER BY date DESC',
        //     [habitId]
        // );
        const [progress] = await db.execute(
            'SELECT DATE_FORMAT(date, "%Y-%m-%d") AS date, status, notes FROM habit_progress WHERE habit_id = ? ORDER BY date DESC',
            [habitId]
        );

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress', error: error.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, duration, status } = req.body;
        const habitId = req.params.id;
        const userId = req.user.id;

        const [habit] = await db.execute(
            'SELECT * FROM habits WHERE id = ? AND user_id = ?',
            [habitId, userId]
        );

        if (!habit.length) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        await db.execute(
            'UPDATE habits SET title = ?, description = ?, duration = ?, status = ? WHERE id = ?',
            [title, description, duration, status, habitId]
        );

        res.json({ message: 'Habit updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating habit', error: error.message });
    }
});


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