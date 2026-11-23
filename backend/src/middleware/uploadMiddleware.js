import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const createUpload = ({ allowedExtensions, maxFileSize, message }) =>
  multer({
    storage,
    fileFilter: (req, file, callback) => {
      const extension = path.extname(file.originalname || "").toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        return callback(new Error(message));
      }
      callback(null, true);
    },
    limits: { fileSize: maxFileSize },
  });

const uploadCV = createUpload({
  allowedExtensions: [".pdf", ".doc", ".docx"],
  maxFileSize: 5 * 1024 * 1024,
  message: "Only PDF, DOC and DOCX files are allowed.",
});

export const uploadImage = createUpload({
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  maxFileSize: 3 * 1024 * 1024,
  message: "Only JPG, JPEG, PNG and WEBP profile images are allowed (maximum 3 MB).",
});

export default uploadCV;
