import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "Assets/images");
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${extension}`);
    }
});

const upload = multer({ storage });

export default upload;