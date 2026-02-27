import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params;

    const uploadPath = path.join(
      process.cwd(), // raíz del backend
      "uploads",
      "actas",
      id
    );

    // crear carpeta si no existe
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre =
      file.fieldname === "frente"
        ? `frente${ext}`
        : `dorso${ext}`;

    cb(null, nombre);
  }
});

const uploadActas = multer({ storage });

export default uploadActas;
