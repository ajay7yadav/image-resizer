import path from "path";
import { fileURLToPath } from "url";
// import fs from "fs/promises";

import resizeService from "../services/resize.service.js";

const resizeImage = async(req, res)=>{
    const fileName = fileURLToPath(import.meta.url);
    const dirName = path.dirname(fileName);
    const maintainAspectRatio = req.body.maintainAspectRatio !== "false";

    try {
        // Check image
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an image"
            });
        }

        // Get dimensions
        const width = Number(req.body.width);
        const height = Number(req.body.height);

        // Get Image Quality
        const quality = Number(req.body.quality);

        // Check width
        if (!Number.isInteger(width) || width <= 0) {
            return res.status(400).json({
                message: "Width must be a positive number"
            });
        }

        // Check height
        if (!Number.isInteger(height) || height <= 0) {
            return res.status(400).json({
                message: "Height must be a positive number"
            });
        }

        // Check quality
        if (!Number.isInteger(quality) || quality < 10 || quality > 100){
            return res.status(400).json({
                message: "Quality must be between 10 and 100"
            });
        }

        // Maximum dimension
        const MAX_DIMENSION = 5000;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            return res.status(400).json({
                message: `Width and height cannot be greater than ${MAX_DIMENSION}px`
            });
        }

        const inputPath = req.file.path;

        const outputFileName = `resized-${req.file.filename}`;

        const outputPath = path.join(
            dirName,
            "../../output",
            outputFileName
        );

        const outputInfo = await resizeService.resizeImage(
            inputPath,
            outputPath,
            width,
            height,
            quality,
            maintainAspectRatio
        );

        return res.status(200).send({
            message: "Image resized successfully",
            filename: outputFileName,
            width: outputInfo.width,
            height: outputInfo.height,
            fileSize: outputInfo.size
        });
    }catch (error){
        console.error("Resize Error:", error);

        return res.status(500).send({
            message: "Something went wrong",
            error: error.message
        });
    }
}

export {
    resizeImage
}