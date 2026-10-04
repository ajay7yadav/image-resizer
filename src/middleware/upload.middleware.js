import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const uploadPath = path.join(dirName, "../../uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const filename = `${Date.now()}${extension}`;

        cb(null, filename);
    }
});

const fileFilter = (req, file, cb)=>{
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if(allowedTypes.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error("Only JPEG, PNG and WebP images are allowed"), false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits : {
        fileSize: 10*1024 * 1024
    }
});

export default upload;