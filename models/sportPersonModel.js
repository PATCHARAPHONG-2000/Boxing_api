const db = require('../config/db');

// ดึงข้อมูลทั้งหมด
exports.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM sport_person');
    return rows;
};

// เพิ่มข้อมูลใหม่
exports.create = async ({ person_red, person_blue, image_red, image_blue }) => {
    const [result] = await db.query(
        'INSERT INTO sport_person (person_red, person_blue, image_red, image_blue) VALUES (?, ?, ?, ?)',
        [person_red, person_blue, image_red, image_blue]
    );
    return { id: result.insertId, person_red, person_blue, image_red, image_blue };
};
