const db = require("../config/db");

exports.getAllMatches = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM data_score");
    res.json({data});
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

exports.addScore = async (req, res) => {
  const {
    sport_person_id,
    R1_JR1,
    R1_JR2,
    R1_JR3,
    R1_JB1,
    R1_JB2,
    R1_JB3,
    R2_JR1,
    R2_JR2,
    R2_JR3,
    R2_JB1,
    R2_JB2,
    R2_JB3,
    R3_JR1,
    R3_JR2,
    R3_JR3,
    R3_JB1,
    R3_JB2,
    R3_JB3,
    R4_JR1,
    R4_JR2,
    R4_JR3,
    R4_JB1,
    R4_JB2,
    R4_JB3,
    R5_JR1,
    R5_JR2,
    R5_JR3,
    R5_JB1,
    R5_JB2,
    R5_JB3,
  } = req.body;

  try {
    if (!sport_person_id) {
      return res
        .status(400)
        .json({ status: false, message: "sport_person_id is required" });
    }

    // ดึงข้อมูลคะแนนปัจจุบันจากตาราง data_score
    const [existingData] = await db.query(
      "SELECT * FROM data_score WHERE sport_person_id = ?",
      [sport_person_id]
    );

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Data score not found for the given sport_person_id",
      });
    }

    const currentData = existingData[0]; // ข้อมูลคะแนนปัจจุบันจากฐานข้อมูล

    // ฟังก์ชันช่วยในการคำนวณผลรวมคะแนน
    const calculateSum = (current, value) => {
      // แปลงค่าทั้งสองเป็นตัวเลขก่อนการบวก
      return (parseFloat(current) || 0) + (parseFloat(value) || 0);
    };

    // ในส่วนที่ทำการคำนวณคะแนน
    const updatedScores = {
      Score_JR1: R1_JR1
        ? calculateSum(currentData.Score_JR1, R1_JR1)
        : currentData.Score_JR1,
      Score_JB1: R1_JB1
        ? calculateSum(currentData.Score_JB1, R1_JB1)
        : currentData.Score_JB1,
      Score_JR2: R1_JR2
        ? calculateSum(currentData.Score_JR2, R1_JR2)
        : currentData.Score_JR2,
      Score_JB2: R1_JB2
        ? calculateSum(currentData.Score_JB2, R1_JB2)
        : currentData.Score_JB2,
      Score_JR3: R1_JR3
        ? calculateSum(currentData.Score_JR3, R1_JR3)
        : currentData.Score_JR3,
      Score_JB3: R1_JB3
        ? calculateSum(currentData.Score_JB3, R1_JB3)
        : currentData.Score_JB3,
    };

    // ตรวจสอบค่าของ R2 และ R3 หากมีให้คำนวณต่อ
    if (R2_JR1 || R2_JB1 || R2_JR2 || R2_JB2 || R2_JR3 || R2_JB3) {
      updatedScores.Score_JR1 = calculateSum(updatedScores.Score_JR1, R2_JR1);
      updatedScores.Score_JB1 = calculateSum(updatedScores.Score_JB1, R2_JB1);
      updatedScores.Score_JR2 = calculateSum(updatedScores.Score_JR2, R2_JR2);
      updatedScores.Score_JB2 = calculateSum(updatedScores.Score_JB2, R2_JB2);
      updatedScores.Score_JR3 = calculateSum(updatedScores.Score_JR3, R2_JR3);
      updatedScores.Score_JB3 = calculateSum(updatedScores.Score_JB3, R2_JB3);
    }

    if (R3_JR1 || R3_JB1 || R3_JR2 || R3_JB2 || R3_JR3 || R3_JB3) {
      updatedScores.Score_JR1 = calculateSum(updatedScores.Score_JR1, R3_JR1);
      updatedScores.Score_JB1 = calculateSum(updatedScores.Score_JB1, R3_JB1);
      updatedScores.Score_JR2 = calculateSum(updatedScores.Score_JR2, R3_JR2);
      updatedScores.Score_JB2 = calculateSum(updatedScores.Score_JB2, R3_JB2);
      updatedScores.Score_JR3 = calculateSum(updatedScores.Score_JR3, R3_JR3);
      updatedScores.Score_JB3 = calculateSum(updatedScores.Score_JB3, R3_JB3);
    }

    // ตรวจสอบค่าของ R4 และ R5 หากมีให้คำนวณต่อ
    if (R4_JR1 || R4_JB1 || R4_JR2 || R4_JB2 || R4_JR3 || R4_JB3) {
      updatedScores.Score_JR1 = calculateSum(updatedScores.Score_JR1, R4_JR1);
      updatedScores.Score_JB1 = calculateSum(updatedScores.Score_JB1, R4_JB1);
      updatedScores.Score_JR2 = calculateSum(updatedScores.Score_JR2, R4_JR2);
      updatedScores.Score_JB2 = calculateSum(updatedScores.Score_JB2, R4_JB2);
      updatedScores.Score_JR3 = calculateSum(updatedScores.Score_JR3, R4_JR3);
      updatedScores.Score_JB3 = calculateSum(updatedScores.Score_JB3, R4_JB3);
    }

    if (R5_JR1 || R5_JB1 || R5_JR2 || R5_JB2 || R5_JR3 || R5_JB3) {
      updatedScores.Score_JR1 = calculateSum(updatedScores.Score_JR1, R5_JR1);
      updatedScores.Score_JB1 = calculateSum(updatedScores.Score_JB1, R5_JB1);
      updatedScores.Score_JR2 = calculateSum(updatedScores.Score_JR2, R5_JR2);
      updatedScores.Score_JB2 = calculateSum(updatedScores.Score_JB2, R5_JB2);
      updatedScores.Score_JR3 = calculateSum(updatedScores.Score_JR3, R5_JR3);
      updatedScores.Score_JB3 = calculateSum(updatedScores.Score_JB3, R5_JB3);
    }

    // อัปเดตค่าคะแนนรวมในฐานข้อมูล
    const [updateResult] = await db.query(
      `UPDATE data_score SET 
                Score_JR1 = ?, Score_JB1 = ?, 
                Score_JR2 = ?, Score_JB2 = ?, 
                Score_JR3 = ?, Score_JB3 = ? 
            WHERE sport_person_id = ?`,
      [
        updatedScores.Score_JR1,
        updatedScores.Score_JB1,
        updatedScores.Score_JR2,
        updatedScores.Score_JB2,
        updatedScores.Score_JR3,
        updatedScores.Score_JB3,
        sport_person_id,
      ]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "Failed to update scores",
      });
    }

    // เพิ่มการอัปเดตคอลัมน์ Round ในตาราง sport_person
    const [roundUpdateResult] = await db.query(
      `UPDATE sport_person SET Round = Round + 1 WHERE sport_person_id = ?`,
      [sport_person_id]
    );

    if (roundUpdateResult.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "Failed to update Round",
      });
    }

    return res.json({
      status: true,
      message: "Scores and Round updated successfully",
      updatedScores,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to update data" });
  }
};

exports.saveManualScores = async (req, res) => {
  const { sport_person_id, R, JR1, JR2, JR3, JB1, JB2, JB3 } = req.body;

  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !sport_person_id ||
      !R ||
      !JR1 ||
      !JR2 ||
      !JR3 ||
      !JB1 ||
      !JB2 ||
      !JB3
    ) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    // แปลงค่าจากสตริงเป็นตัวเลข
    const floatJR1 = parseFloat(JR1);
    const floatJR2 = parseFloat(JR2);
    const floatJR3 = parseFloat(JR3);
    const floatJB1 = parseFloat(JB1);
    const floatJB2 = parseFloat(JB2);
    const floatJB3 = parseFloat(JB3);

    console.log("Received values:", { JR1, JR2, JR3, JB1, JB2, JB3 });  // ตรวจสอบค่าที่ส่งมา

    // ดึงข้อมูลเก่าจากฐานข้อมูล
    const [existingData] = await db.query(
      `SELECT Score_JR1, Score_JR2, Score_JR3, Score_JB1, Score_JB2, Score_JB3 FROM data_score WHERE sport_person_id = ?`,
      [sport_person_id]
    );

    // ตรวจสอบข้อมูลว่ามีอยู่ในฐานข้อมูลหรือไม่
    if (existingData.length === 0) {
      return res.status(404).json({ status: false, message: "Data not found" });
    }

    console.log("Existing data:", existingData[0]);  // ตรวจสอบค่าที่ดึงมาในฐานข้อมูล

    // คำนวณคะแนนที่บวกแล้ว โดยไม่ต้องเช็คว่าเป็นทศนิยมหรือไม่
    const updatedScores = {
      Score_JR1: (parseFloat(existingData[0].Score_JR1) || 0) + floatJR1,
      Score_JR2: (parseFloat(existingData[0].Score_JR2) || 0) + floatJR2,
      Score_JR3: (parseFloat(existingData[0].Score_JR3) || 0) + floatJR3,
      Score_JB1: (parseFloat(existingData[0].Score_JB1) || 0) + floatJB1,
      Score_JB2: (parseFloat(existingData[0].Score_JB2) || 0) + floatJB2,
      Score_JB3: (parseFloat(existingData[0].Score_JB3) || 0) + floatJB3,
    };

    console.log("Updated Scores after addition:", updatedScores);  // ตรวจสอบคะแนนหลังบวก

    // อัพเดตคะแนนในฐานข้อมูล
    const [updateResult] = await db.query(
      `UPDATE data_score 
      SET Score_JR1 = ?, Score_JR2 = ?, Score_JR3 = ?, Score_JB1 = ?, Score_JB2 = ?, Score_JB3 = ?
      WHERE sport_person_id = ?`,
      [
        updatedScores.Score_JR1,
        updatedScores.Score_JR2,
        updatedScores.Score_JR3,
        updatedScores.Score_JB1,
        updatedScores.Score_JB2,
        updatedScores.Score_JB3,
        sport_person_id,
      ]
    );

    // ตรวจสอบผลลัพธ์การอัพเดต
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "Failed to update scores",
      });
    }

    console.log("Scores updated successfully"); // แสดงข้อความเมื่อการอัพเดตสำเร็จ

    // บันทึกค่าจาก scores (R{R}_JR1, R{R}_JR2, ฯลฯ) ลงในคอลัมน์ต่าง ๆ
    const [result] = await db.query(
      `UPDATE data_score SET R${R}_JR1 = ?, R${R}_JR2 = ?, R${R}_JR3 = ?, R${R}_JB1 = ?, R${R}_JB2 = ?, R${R}_JB3 = ?
      WHERE sport_person_id = ?`,
      [
        floatJR1,
        floatJR2,
        floatJR3,
        floatJB1,
        floatJB2,
        floatJB3,
        sport_person_id,
      ]
    );

    // ตรวจสอบผลลัพธ์การอัพเดต
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "Failed to update R-based scores",
      });
    }

    // ส่งผลลัพธ์การอัพเดตกลับ
    return res.json({
      status: true,
      message: "Scores updated successfully",
    });

  } catch (err) {
    console.error("Error:", err); // Log for debugging
    res.status(500).json({ status: false, message: "Failed to update data" });
  }
};

exports.updatedScores = async (req, res) => {
  const { sport_person_id, roundNumber, updatedScores } = req.body;

  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !sport_person_id ||
      !roundNumber ||
      !updatedScores ||
      Object.keys(updatedScores).length === 0
    ) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    // ดึงข้อมูลคะแนนปัจจุบันจากตาราง data_score
    const [existingData] = await db.query(
      "SELECT * FROM data_score WHERE sport_person_id = ?",
      [sport_person_id]
    );

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Data score not found for the given sport_person_id",
      });
    }

    // สร้างคำสั่ง SQL สำหรับการอัปเดตคะแนนหลายๆ คอลัมน์
    // ตรวจสอบและเตรียมค่าคะแนนที่จะอัปเดต
    const updateColumns = [];
    const values = [];

    for (const [column, score] of Object.entries(updatedScores)) {
      if (score !== "") {
        // หากไม่เป็นค่าว่าง
        const redColumn = `R${roundNumber}_JR${column.substring(2)}`; // ใช้ substring() แทน replace()
        const blueColumn = `R${roundNumber}_JB${column.substring(2)}`; // ใช้ substring() แทน replace()

        updateColumns.push(`${redColumn} = ?, ${blueColumn} = ?`);
        values.push(score, score); // เพิ่มค่าให้กับทั้งสองคอลัมน์
      } else {
        // หากเป็นค่าว่างให้ใช้ NULL แทน
        const redColumn = `R${roundNumber}_JR${column.substring(2)}`;
        const blueColumn = `R${roundNumber}_JB${column.substring(2)}`;

        updateColumns.push(`${redColumn} = NULL, ${blueColumn} = NULL`);
        values.push(null, null); // กำหนดเป็น NULL
      }
    }

    const [updateResult] = await db.query(
      `UPDATE data_score SET ${updateColumns.join(
        ", "
      )} WHERE sport_person_id = ?`,
      [...values, sport_person_id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "Failed to update scores",
      });
    }

    return res.json({
      status: true,
      message: "Scores updated successfully",
      updatedScores,
    });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ status: false, message: "Failed to update data" });
  }
};


