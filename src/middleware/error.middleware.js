import multer from "multer";

const errorMiddleware = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).send({
                message: "Image size cannot be greater than 10 MB"
            });
        }

        return res.status(400).send({
            message: err.message
        });
    }

    if (err) {
        return res.status(400).send({
            message: err.message
        });
    }

    return res.status(500).send({
        message: "Something went wrong"
    });
};

export default errorMiddleware;