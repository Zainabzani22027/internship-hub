import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadRoot = path.resolve(__dirname, "../../uploads");

const uploadToCloudinary = async (file, folder, resourceType) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const extension = path.extname(file.originalname || "").toLowerCase();
  const publicId = `${folder}/${crypto.randomUUID()}${resourceType === "raw" ? extension : ""}`;
  const signatureSource = `access_mode=public&public_id=${publicId}&timestamp=${timestamp}&type=upload${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signatureSource).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("public_id", publicId);
  form.append("access_mode", "public");
  form.append("type", "upload");
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: form }
  );

  const data = await response.json();
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Cloud file upload failed.");
  }

  return data.secure_url;
};

const saveUploadedFile = async (file, folder, resourceType) => {
  const cloudUrl = await uploadToCloudinary(file, folder, resourceType);
  if (cloudUrl) return cloudUrl;

  if (process.env.VERCEL) {
    throw new Error("File storage is not configured for production. Add Cloudinary environment variables.");
  }

  const targetDirectory = path.join(localUploadRoot, folder);
  await fs.mkdir(targetDirectory, { recursive: true });

  const extension = path.extname(file.originalname || "").toLowerCase();
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  await fs.writeFile(path.join(targetDirectory, filename), file.buffer);

  return `/uploads/${folder}/${filename}`;
};

const deleteLocalUpload = async (url) => {
  if (!url || !url.startsWith("/uploads/")) return;
  const relativePath = url.replace(/^\/uploads\//, "");
  const fullPath = path.resolve(localUploadRoot, relativePath);
  if (!fullPath.startsWith(`${localUploadRoot}${path.sep}`)) return;
  try {
    await fs.unlink(fullPath);
  } catch {
    // File cleanup is best-effort.
  }
};

export const uploadStudentCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select a CV file." });
    }

    const cvUrl = await saveUploadedFile(req.file, "cv", "auto");
    const result = await pool.query(
      `
      UPDATE student_profiles
      SET cv_url = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING cv_url
      `,
      [cvUrl, req.user.id]
    );

    if (!result.rows.length) {
      await deleteLocalUpload(cvUrl);
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    return res.status(200).json({
      success: true,
      message: "CV uploaded successfully.",
      cvUrl: result.rows[0].cv_url,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload student CV error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to upload CV.",
    });
  }
};

export const uploadStudentProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select a profile image." });
    }

    const imageUrl = await saveUploadedFile(req.file, "profile-images", "image");
    const result = await pool.query(
      `
      UPDATE student_profiles
      SET profile_image_url = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING profile_image_url
      `,
      [imageUrl, req.user.id]
    );

    if (!result.rows.length) {
      await deleteLocalUpload(imageUrl);
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      imageUrl: result.rows[0].profile_image_url,
    });
  } catch (error) {
    console.error("Upload student profile image error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to upload profile image.",
    });
  }
};
