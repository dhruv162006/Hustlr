import multer from "multer";

const storage = multer.memoryStorage();

// Accept images, pdfs, and general project assets
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
