import sharp from "sharp";
// import path from "path";

/*
inputPath  → original image location
outputPath → where resized image should be saved
width      → new width
height     → new height
*/

const resizeImage = async (
    inputPath,
    outputPath,
    width,
    height,
    quality,
    maintainAspectRatio = true
) => {

    const image = sharp(inputPath);

    const metadata = await image.metadata();

    const format = metadata.format;

    const resizeOptions = {
        width
    };

    if (maintainAspectRatio) {
        resizeOptions.fit = "inside";
        resizeOptions.withoutEnlargement = false;
    } else {
        resizeOptions.height = height;
        resizeOptions.fit = "fill";
    }

    let processedImage = image.resize(resizeOptions);

    // Apply quality based on image format
    if (format === "jpeg") {

        processedImage = processedImage.jpeg({
            quality
        });

    } else if (format === "png") {

        processedImage = processedImage.png({
            quality
        });

    } else if (format === "webp") {

        processedImage = processedImage.webp({
            quality
        });

    } else {

        throw new Error(
            "Unsupported image format"
        );
    }

    const result = await processedImage.toFile(
        outputPath
    );

    return {
        width: result.width,
        height: result.height,
        size: result.size
    };
};

export default {
    resizeImage
};