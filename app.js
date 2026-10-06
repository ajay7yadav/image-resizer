import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import route from "./src/routes/resize.route.js";
import errorMiddleware from "./src/middleware/error.middleware.js";
import cleanupService from "./src/services/cleanup.service.js";

const app = express();
const PORT = 3000;

// Get Current Directory
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

// Serve Frontend
app.use(express.static(path.join(dirName, "public")));

app.use("/output", express.static(path.join(dirName, "output")));

route(app);

// Error handling || Multer Error handling
app.use(errorMiddleware);

// Cleanup service is executing
setInterval(() => {
    cleanupService.cleanupOldFiles(24)
        .catch((error) => {
            console.error("Cleanup error:", error.message);
        });
}, 60 * 60 * 1000);

cleanupService.cleanupOldFiles(24)
    .catch((error) => {
        console.error("Initial cleanup error:", error.message);
    });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});