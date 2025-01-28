const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ตั้งค่า JWT_SECRET โดยตรง (ไม่แนะนำสำหรับ production)
const JWT_SECRET = 'your_secret_key';

exports.getAllLogin = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    }
};

exports.loginadmin = async (req, res) => {
    console.log('[loginadmin] Request Body:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    try {
        const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (!user || user.length === 0) {
            return res.status(401).json({ status: false, message: 'ไม่พบผู้ใช้งานนี้' });
        }

        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(401).json({ status: false, message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        const token = jwt.sign({ id: user[0].id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            status: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            data: {
                id: user[0].id,
                name: user[0].name,
                role: user[0].role,
            },
            token,
        });

    } catch (error) {
        console.error('[loginadmin] Error:', error);
        res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    }
    
};