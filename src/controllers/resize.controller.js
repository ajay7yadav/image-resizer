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
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an image"
            });
        }

        let width = Number(req.body.width);
        let height = Number(req.body.height);
        const quality = Number(req.body.quality ?? 80);
        const format = req.body.format?.toLowerCase() || null;
        const allowedFormats = ["jpg", "jpeg", "png", "webp"];

        if (format && !allowedFormats.includes(format)) {
            return res.status(400).json({
                message: "Format must be JPG, PNG or WebP"
            });
        }

        if (!Number.isInteger(width) || width <= 0) {
            return res.status(400).json({
                message: "Width must be a positive number"
            });
        }

        if (!Number.isInteger(height) || height <= 0) {
            return res.status(400).json({
                message: "Height must be a positive number"
            });
        }

        if (!Number.isInteger(quality) || quality < 10 || quality > 100) {
            return res.status(400).json({
                message: "Quality must be between 10 and 100"
            });
        }

        const MAX_DIMENSION = 5000;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            return res.status(400).json({
                message: `Width and height cannot be greater than ${MAX_DIMENSION}px`
            });
        }

        inputPath = req.file.path;

        let outputFormat = format;
        if (!outputFormat) {
            outputFormat = path.extname(req.file.originalname)
                .replace(".", "")
                .toLowerCase();
        }

        if (outputFormat === "jpeg") {
            outputFormat = "jpg";
        }

        // const outputFileName = `resized-${Date.now()}.${outputFormat}`;

        const originalName = path.parse(req.file.originalname).name;

        const safeName = originalName
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

        const outputFileName = `${safeName || "image"}-resized.${outputFormat}`;
        
        const outputPath = path.join(
            dirName,
            "../../output",
            outputFileName
        );

        // Perform resize passing the resolved outputFormat
        const outputInfo = await resizeService.resizeImage(
            inputPath,
            outputPath,
            width,
            height,
            quality,
            maintainAspectRatio,
            outputFormat
        );

        const fileStats = await fs.stat(outputPath);
        const fileSize = fileStats.size;

        const originalFileSize = req.file.size;

        const sizeReduction = originalFileSize > 0
            ? Math.max(
                0,
                ((originalFileSize - fileSize) / originalFileSize) * 100
            )
            : 0;

        return res.status(200).json({
            success : true,
            message: "Image resized successfully",
            data : {
                filename: outputFileName,
                width: outputInfo.width,
                height: outputInfo.height,
                quality,
                maintainAspectRatio,
                format: outputFormat,
                fileSize,
                originalFileSize,
                sizeReduction: Number(sizeReduction.toFixed(2))
            }
        });

    } catch (error) {
        console.error("Resize Error:", error);

        if (error.message?.includes("unsupported image format")) {
            return res.status(400).json({
                message: "The uploaded file is not a valid image"
            });
        }

        return res.status(500).json({
            message: "Something went wrong processing the image"
        });

    } finally {
        if (inputPath) {
            try {
                await fs.unlink(inputPath);
            } catch (cleanupError) {
                console.error("Upload cleanup error:", cleanupError.message);
            }
        }
    }
};

export { resizeImage };