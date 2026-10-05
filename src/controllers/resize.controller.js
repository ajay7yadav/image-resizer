import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

import resizeService from "../services/resize.service.js";

const resizeImage = async (req, res) => {
    const fileName = fileURLToPath(import.meta.url);
    const dirName = path.dirname(fileName);
    const maintainAspectRatio = req.body.maintainAspectRatio !== "false";

    let inputPath = null;

    try {
        // Check image
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an image"
            });
        }

        // Get dimensions
        let width = Number(req.body.width);
        let height = Number(req.body.height);

        // Get Image Quality
        const quality = Number(req.body.quality ?? 80);

        const format = req.body.format?.toLowerCase() || null;

        const allowedFormats = ["jpg", "jpeg", "png", "webp"];

        // Check format
        if (format && !allowedFormats.includes(format)) {

            return res.status(400).json({
                message: "Format must be JPG, PNG or WebP"
            });
        }

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
        if (!Number.isInteger(quality) || quality < 10 || quality > 100) {
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

        inputPath = req.file.path;

        let outputFormat = format;

        // If format is not provided, 
        // keep original file format.

        if (!outputFormat) {

            outputFormat = path.extname(req.file.originalname)
                .replace(".", "").toLowerCase();
        }

        // JPEG should use jpg extension 
        if (outputFormat === "jpeg") {

            outputFormat = "jpg";
        }

        // Output Filename
        const outputFileName = `resized-${Date.now()}.${outputFormat}`;
        // const outputPath = path.join( __dirname, "../../output", outputFilename );

        // const outputFileName = `resized-${req.file.filename}`;

        const outputPath = path.join(
            dirName,
            "../../output",
            outputFileName
        );

        // Resize Image
        const outputInfo = await resizeService.resizeImage(
            inputPath,
            outputPath,
            width,
            height,
            quality,
            maintainAspectRatio,
            format
        );

        // Get Output File Size
        const fileStats = await fs.stat(outputPath);
        const fileSize = fileStats.size;

        return res.status(200).send({
            message: "Image resized successfully",
            filename: outputFileName,
            width: outputInfo.width,
            height: outputInfo.height,
            quality,
            maintainAspectRatio,
            // fileSize: outputInfo.size,
            format: outputFormat,
            fileSize
        });

    } catch (error) {

        console.error("Resize Error:", error);

        if (
            error.message ===
            "Input file contains unsupported image format"
        ) {
            return res.status(400).send({
                message: "The uploaded file is not a valid image"
            });
        }

        return res.status(500).send({
            message: "Something went wrong"
        });

    } finally {

        if (inputPath) {

            try {
                await fs.unlink(inputPath);
            } catch (cleanupError) {

                console.error(
                    "Upload cleanup error:",
                    cleanupError.message
                );

            }
        }
    }
}

export {
    resizeImage
}