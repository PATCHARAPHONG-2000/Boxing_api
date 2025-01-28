const e = require('express');
const db = require('../config/db');


exports.getAllMatches = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM data_match');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    }
};


exports.addMatch = async (req, res) => {
    const { Match_Name } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO data_match (name_match) VALUES (?)',
            [Match_Name]
        );
        res.json({
            status: true,
            message: 'Data inserted successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Failed to insert data' });
    }
};


exports.updateMatch = async (req, res) => {
    const { Match_Name, id } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE data_match SET name_match = ? WHERE id = ?',
            [Match_Name, id]
        );
        res.json({
            status: true,
            message: 'Data updated successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Failed to update data' });
    }
};
