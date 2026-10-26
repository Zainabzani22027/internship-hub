import pool from "../config/db.js";
import fs from "fs";

export const uploadStudentCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a CV file.",
      });
    }

    const cvUrl = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `
      UPDATE student_profiles
      SET cv_url = $1
      WHERE user_id = $2
      RETURNING cv_url
      `,
      [cvUrl, req.user.id]
    );

    if (result.rows.length === 0) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}

      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "CV uploaded successfully.",
      cvUrl: result.rows[0].cv_url,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload student CV error:", error);

    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }

    return res.status(500).json({
      success: false,
      message: "Unable to upload CV.",
      error: error.message,
    });
  }
};