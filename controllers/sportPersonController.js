const db = require('../config/db');
const fs = require('fs').promises;
const path = require('path');


// ฟังก์ชันอัพโหลดไฟล์ไปยัง S3
const uploadToS3 = (file) => {
    const fileStream = fs.createReadStream(file.path); // เปิดไฟล์จาก path ที่อยู่ในเซิร์ฟเวอร์
    const uploadParams = {
        Bucket: 'YOUR_BUCKET_NAME', // เปลี่ยนเป็นชื่อบัคเก็ตของคุณ
        Key: `uploads/${Date.now()}_${file.originalname}`, // ตั้งชื่อไฟล์ใน S3
        Body: fileStream,
        ContentType: file.mimetype, // ประเภทไฟล์
        ACL: 'public-read' // ทำให้ไฟล์สามารถเข้าถึงได้จากภายนอก
    };
    return s3.upload(uploadParams).promise(); // ใช้การอัพโหลดแบบ Promise
};

// ดึงข้อมูลทั้งหมด
exports.getAllSportPersons = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sport_person');
        
        // เพิ่ม URL สำหรับไฟล์รูปภาพโดยการรวม URL ของเซิร์ฟเวอร์
        const data = rows.map(item => ({
            ...item,
            image_red: item.image_red ? `https://boxing-api.onrender.com/uploads/${item.image_red}` : null,
            image_blue: item.image_blue ? `https://boxing-api.onrender.com/uploads/${item.image_blue}` : null
        }));

        res.json({
            status: true,
            message: 'Data retrieved successfully',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Failed to fetch data' });
    }
};



// เพิ่มข้อมูลใหม่
// exports.addSportPerson = async (req, res) => {
//     const { person_red, person_blue, Match_Type } = req.body;
//     const image_red = req.files['image_red'] ? req.files['image_red'][0].filename : null;
//     const image_blue = req.files['image_blue'] ? req.files['image_blue'][0].filename : null;

//     try {
//         // ดึงข้อมูลชื่อ match จากฐานข้อมูล
//         const [matchData] = await db.query(
//             'SELECT name_match FROM data_match WHERE id = ?',
//             [1] // กำหนด id ที่ต้องการดึง (ตัวอย่างนี้ใช้ id = 1)
//         );

//         if (!matchData || matchData.length === 0) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Match data not found'
//             });
//         }

//         const name_match = matchData[0].name_match; // ดึงค่า name_match จากผลลัพธ์

//         // สร้าง sport_person_id แบบ TKS001, TKS002, ...
//         let sport_person_id;
//         let isUnique = false;

//         // เช็คจนกว่า sport_person_id จะไม่ซ้ำ
//         while (!isUnique) {
//             // คำนวณจำนวนผู้เล่นทั้งหมดใน sport_person เพื่อเพิ่มหมายเลข
//             const [existingPersons] = await db.query(
//                 'SELECT COUNT(*) AS count FROM sport_person'
//             );

//             // สร้าง sport_person_id โดยการเพิ่มหมายเลขใหม่
//             sport_person_id = `TKS${(existingPersons[0].count + 1).toString().padStart(3, '0')}`;

//             // ตรวจสอบว่ามี sport_person_id นี้ในฐานข้อมูลหรือไม่
//             const [existingSportPerson] = await db.query(
//                 'SELECT * FROM sport_person WHERE sport_person_id = ?',
//                 [sport_person_id]
//             );

//             if (existingSportPerson.length === 0) {
//                 // ถ้าไม่มีการใช้ sport_person_id นี้แล้ว, อนุญาตให้บันทึกข้อมูล
//                 isUnique = true;
//             }
//         }

//         // บันทึกข้อมูลผู้เล่นใหม่ลงฐานข้อมูลในตาราง sport_person
//         const [result] = await db.query(
//             'INSERT INTO sport_person (sport_person_id, person_red, person_blue, image_red, image_blue, name_match, Role) VALUES (?, ?, ?, ?, ?, ?, ?)',
//             [sport_person_id, person_red, person_blue, image_red, image_blue, name_match, Match_Type]
//         );

//         // บันทึกข้อมูลในตาราง data_score โดยใช้ sport_person_id ที่ได้มา
//         await db.query(
//             'INSERT INTO data_score (sport_person_id) VALUES (?)',
//             [sport_person_id] // กำหนดคะแนนเริ่มต้นเป็น 0 หรือค่าที่ต้องการ
//         );

//         res.json({
//             status: true,
//             message: 'Data inserted successfully',
//             insertedId: result.insertId,
//             sport_person_id
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ status: false, message: 'Failed to insert data' });
//     }
// };

exports.addSportPerson = async (req, res) => {
    const { person_red, person_blue, Match_Type } = req.body;
    const image_red = req.files['image_red'] ? req.files['image_red'][0] : null;
    const image_blue = req.files['image_blue'] ? req.files['image_blue'][0] : null;

    try {
        // ดึงข้อมูลชื่อ match จากฐานข้อมูล
        const [matchData] = await db.query(
            'SELECT name_match FROM data_match WHERE id = ?',
            [1] // กำหนด id ที่ต้องการดึง (ตัวอย่างนี้ใช้ id = 1)
        );

        if (!matchData || matchData.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Match data not found'
            });
        }

        const name_match = matchData[0].name_match; // ดึงค่า name_match จากผลลัพธ์

        // สร้าง sport_person_id แบบ TKS001, TKS002, ...
        let sport_person_id;
        let isUnique = false;

        // เช็คจนกว่า sport_person_id จะไม่ซ้ำ
        while (!isUnique) {
            // คำนวณจำนวนผู้เล่นทั้งหมดใน sport_person เพื่อเพิ่มหมายเลข
            const [existingPersons] = await db.query(
                'SELECT COUNT(*) AS count FROM sport_person'
            );

            // สร้าง sport_person_id โดยการเพิ่มหมายเลขใหม่
            sport_person_id = `TKS${(existingPersons[0].count + 1).toString().padStart(3, '0')}`;

            // ตรวจสอบว่ามี sport_person_id นี้ในฐานข้อมูลหรือไม่
            const [existingSportPerson] = await db.query(
                'SELECT * FROM sport_person WHERE sport_person_id = ?',
                [sport_person_id]
            );

            if (existingSportPerson.length === 0) {
                isUnique = true;
            }
        }

        // อัพโหลดรูปภาพไปยัง S3 และเก็บ URL
        const image_red_url = image_red ? await uploadToS3(image_red) : null;
        const image_blue_url = image_blue ? await uploadToS3(image_blue) : null;

        // บันทึกข้อมูลผู้เล่นใหม่ลงฐานข้อมูลในตาราง sport_person
        const [result] = await db.query(
            'INSERT INTO sport_person (sport_person_id, person_red, person_blue, image_red, image_blue, name_match, Role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                sport_person_id,
                person_red,
                person_blue,
                image_red_url ? image_red_url.Location : null, // URL ของภาพจาก S3
                image_blue_url ? image_blue_url.Location : null, // URL ของภาพจาก S3
                name_match,
                Match_Type
            ]
        );

        // บันทึกข้อมูลในตาราง data_score โดยใช้ sport_person_id ที่ได้มา
        await db.query(
            'INSERT INTO data_score (sport_person_id) VALUES (?)',
            [sport_person_id]
        );

        res.json({
            status: true,
            message: 'Data inserted successfully',
            insertedId: result.insertId,
            sport_person_id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Failed to insert data' });
    }
};

// อัปเดตข้อมูล
exports.updateSportPerson = async (req, res) => {
    const { id } = req.params;
    const { person_red, person_blue } = req.body;

    try {
        // Validation
        if (!person_red || !person_blue) {
            return res.status(400).json({
                status: false,
                message: 'Both person_red and person_blue are required'
            });
        }

        // ตรวจสอบไฟล์ที่อัปโหลดใหม่
        const image_red = req.files?.['image_red']?.[0]?.filename || null;
        const image_blue = req.files?.['image_blue']?.[0]?.filename || null;

        // ดึงรูปภาพเก่าเพื่อลบออกจากเซิร์ฟเวอร์
        const [oldData] = await db.query('SELECT image_red, image_blue FROM sport_person WHERE id = ?', [id]);

        if (!oldData || oldData.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Record not found'
            });
        }

        const updateFields = ['person_red = ?', 'person_blue = ?'];
        const updateParams = [person_red, person_blue];

        // จัดการคีย์สำหรับ UPDATE (ถ้ามีการส่งรูปใหม่)
        if (image_red) {
            updateFields.push('image_red = ?');
            updateParams.push(image_red);

            // ลบไฟล์เก่า
            try {
                deleteFile(`uploads/${oldData[0].image_red}`);
            } catch (error) {
                console.error('Error deleting file (image_red):', error);
            }
        }
        if (image_blue) {
            updateFields.push('image_blue = ?');
            updateParams.push(image_blue);

            try {
                deleteFile(`uploads/${oldData[0].image_blue}`);
            } catch (error) {
                console.error('Error deleting file (image_blue):', error);
            }
        }

        updateParams.push(id);

        const query = `UPDATE sport_person SET ${updateFields.join(', ')} WHERE id = ?`;
        console.log('Generated Query:', query, updateParams);

        const [result] = await db.query(query, updateParams);

        if (result.affectedRows === 0) {
            return res.status(500).json({
                status: false,
                message: 'Failed to update data'
            });
        }

        res.json({
            status: true,
            message: 'Data updated successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Failed to update data' });
    }
};


exports.updateSportPersonStatus = async (req, res) => {
    const { id } = req.params;
    const { IsActive } = req.body;

    try {
        // Validation
        if (IsActive === undefined) {
            return res.status(400).json({
                status: false,
                message: 'IsActive is required'
            });
        }

        // อัปเดตสถานะ IsActive ในฐานข้อมูล
        const [result] = await db.query(
            'UPDATE sport_person SET IsActive = ? WHERE id = ?',
            [IsActive, id]
        );

        if (result.affectedRows > 0) {
            res.json({
                status: true,
                message: 'Status updated successfully'
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'Data not found'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: 'Failed to update status'
        });
    }
};

exports.updateSportPersonRound = async (req, res) => {
    const { round } = req.body;

    try {
        // Validation
        if (round === undefined) {
            return res.status(400).json({
                status: false,
                message: 'round is required'
            });
        }

        // อัปเดตสถานะ round ในฐานข้อมูล
        const [result] = await db.query(
            'UPDATE sport_person SET Round = ? WHERE IsActive = ?',
            [round, 1]
        );

        if (result.affectedRows > 0) {
            res.json({
                status: true,
                message: 'Round updated successfully'
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'Data not found'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: 'Failed to update round'
        });
    }
};

// ลบข้อมูล
exports.deleteSportPerson = async (req, res) => {
    const { id } = req.params;

    try {
        // ดึงข้อมูลรูปภาพของรายการที่ต้องการลบ
        const [oldData] = await db.query('SELECT image_red, image_blue FROM sport_person WHERE id = ?', [id]);

        if (!oldData || oldData.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Data not found'
            });
        }

        // ลบไฟล์รูปภาพ
        const deleteFile = async (filePath) => {
            try {
                // แก้ไขตำแหน่งไฟล์ใหม่ (ไปที่โฟลเดอร์ uploads ที่อยู่ในระดับเดียวกับโปรเจกต์)
                const fullPath = path.join(__dirname, '..', 'uploads', filePath); // ไปที่โฟลเดอร์ uploads
                await fs.access(fullPath); // ตรวจสอบว่าไฟล์มีอยู่
                await fs.unlink(fullPath); // ลบไฟล์
                console.log(`File deleted: ${fullPath}`);
            } catch (err) {
                console.error(`Error deleting file: ${filePath}`, err);
            }
        };

        const imageRedPath = oldData[0].image_red;
        const imageBluePath = oldData[0].image_blue;

        await deleteFile(imageRedPath);
        await deleteFile(imageBluePath);

        // ลบรายการออกจากฐานข้อมูล
        const [result] = await db.query('DELETE FROM sport_person WHERE id = ?', [id]);

        if (result.affectedRows > 0) {
            res.json({
                status: true,
                message: 'Data deleted successfully'
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'Data not found'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Failed to delete data' });
    }
};