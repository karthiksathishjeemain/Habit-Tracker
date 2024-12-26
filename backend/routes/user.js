const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');
const bcrypt = require('bcrypt')
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


router.put('/', authenticateToken, async (req, res) => {
    try {
        const { name,email, oldPassword, newPassword } = req.body;
        const userId = req.user.id;
        console.log (req.body)
      
        const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user.length) {
            return res.status(404).json({ message: 'User not found' });
        }

     
        const validPassword = await bcrypt.compare(oldPassword, user[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid old password' });
        }

    
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.execute(
            'UPDATE users SET name = ?, email=?,password = ? WHERE id = ?',
            [name,email, hashedNewPassword, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.log("error is ",error)
        res.status(500).json({ message: 'Error updating profile', error: error.message });

    }
});

module.exports = router