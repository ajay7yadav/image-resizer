import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(
    __dirname,
    "../../output"
);

const cleanupOldFiles = async (maxAgeHours = 24) => {

    const files = await fs.readdir(outputPath);

    const now = Date.now();

    const maxAge = maxAgeHours * 60 * 60 * 1000;

    for (const file of files) {

        const filePath = path.join(outputPath, file);

        const stats = await fs.stat(filePath);

        const fileAge = now - stats.mtimeMs;

        if (fileAge > maxAge) {

            await fs.unlink(filePath);

            console.log(`Deleted old output file: ${file}`);
        }
    }
};

export default {
    cleanupOldFiles
};