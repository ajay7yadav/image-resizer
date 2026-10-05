import sharp from "sharp";
import path from "path";

/*
inputPath  → original image location
outputPath → where resized image should be saved
width      → new width
height     → new height
quality     → quality %
maintainAspectRatio     → checked or unchecked
format = png, jpg, web
*/

const resizeImage = async (
    inputPath,
    outputPath,
    width,
    height,
    quality = 80,
    maintainAspectRatio = true,
    format = null
) => {

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

    const image = sharp(inputPath);

    
    // Resize image
    image.resize(resizeOptions);

    // Output format
    if (format === "jpg" || format === "jpeg") { 
        image.jpeg({ quality }); 

    } else if (format === "png") { 
        image.png({ compressionLevel: 9 }); 

    } else if (format === "webp") { 
        image.webp({ quality }); 
    
    } else { 
        // Keep original format 
        image.toFormat("jpeg", { quality }); 
    }

    // Save Image
    const result = await image.toFile(outputPath);
    
    return {
        width: result.width,
        height: result.height,
        size: result.size
    };
};

export default {
    resizeImage
};