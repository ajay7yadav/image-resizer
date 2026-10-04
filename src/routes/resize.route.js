import { resizeImage } from "../controllers/resize.controller.js";
import upload from "../middleware/upload.middleware.js";

export default (app) =>{
    app.get('/ping', (req, res)=>{
        
        res.json({
            message : 'Server is responsed'
        });
    });

    app.post("/api/resize" ,upload.single("image"), resizeImage);
}