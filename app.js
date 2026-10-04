import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import route from "./src/routes/resize.route.js";
import errorMiddleware from "./src/middleware/error.middleware.js";

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

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`); 
});