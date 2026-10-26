import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const safeName = `cv-${req.user.id}-${Date.now()}${extension}`;

    cb(null, safeName);
  },
});

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
];

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(
      new Error(
        "Only PDF, DOC and DOCX files are allowed."
      )
    );
  }

  cb(null, true);
};

const uploadCV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadCV;