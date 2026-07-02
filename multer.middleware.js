import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + file.originalname;
    cb(null, name);
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});
