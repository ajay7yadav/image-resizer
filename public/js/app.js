const resizeForm = document.getElementById("resizeForm");
const imageInput = document.getElementById("image");

const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");

const qualityInput = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");

const aspectRatioCheckbox = document.getElementById("aspectRatio");

const originalPreview = document.getElementById("originalPreview");
const originalInfo = document.getElementById("originalInfo");

const result = document.getElementById("result");
const resultInfo = document.getElementById("resultInfo");

const message = document.getElementById("message");

const resizeButton = document.getElementById("resizeButton");

const dropZone = document.getElementById("dropZone");
const chooseImageButton = document.getElementById("chooseImageButton");

const formatInput = document.getElementById("format");

const resizeModeInput = document.getElementById("resizeMode");
const percentageInput = document.getElementById("percentage");
const percentageGroup = document.getElementById("percentageGroup");

let selectedImage = null;

let originalWidth = 0;
let originalHeight = 0;

let aspectRatio = 0;

const MAX_DIMENSION = 5000;

// -----------------------------------
// File Size Formatter
// -----------------------------------

const formatFileSize = (bytes) => {

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

};

// -----------------------------------
// Image Selection
// -----------------------------------

const handleImageSelection = (file) => {

    if (!file) {
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        message.textContent =
            "Only JPG, PNG and WebP images are allowed.";

        return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {

        message.textContent =
            "Image size cannot be greater than 10 MB.";

        return;
    }

    selectedImage = file;

    const imageUrl =
        URL.createObjectURL(file);

    originalPreview.innerHTML = `
    <h3>Original Image</h3>

    <img
        src="${imageUrl}"
        alt="Original image"
    >
`;

// Input Image information show in frontend
    const image = new Image();

    image.onload = () => {

        originalWidth = image.width;
        originalHeight = image.height;

        aspectRatio =
            originalWidth / originalHeight;

        widthInput.value =
            originalWidth;

        heightInput.value =
            originalHeight;

        originalInfo.innerHTML = `
        <p>
            <strong>Dimensions:</strong>
            ${originalWidth} × ${originalHeight}px
        </p>

        <p>
            <strong>File size:</strong>
            ${formatFileSize(file.size)}
        </p>
        
        <p>
            <strong>Format:</strong>
            ${file.type.split("/")[1].toUpperCase()}
        </p>

        <p>
            <strong>Aspect Ratio:</strong>
            ${aspectRatio.toFixed(2)}
        </p>
    `;

        URL.revokeObjectURL(imageUrl);
    };

    image.src = imageUrl;

    result.innerHTML = "";
    resultInfo.innerHTML = "";
    message.textContent = "";

};

// -----------------------------------
// Image Input
// -----------------------------------

imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];

        handleImageSelection(file);
    }

);

// -----------------------------------
// Choose Image Button
// -----------------------------------

chooseImageButton.addEventListener(
    "click",
    () => {

        imageInput.click();
    }

);

// -----------------------------------
// Drag Over
// -----------------------------------

dropZone.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        dropZone.classList.add(
            "drag-over"
        );
    }

);

// -----------------------------------
// Drag Leave
// -----------------------------------

dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "drag-over"
        );
    }

);

// -----------------------------------
// Drop Image
// -----------------------------------

dropZone.addEventListener(
    "drop",
    (event) => {

        event.preventDefault();

        dropZone.classList.remove(
            "drag-over"
        );

        const file =
            event.dataTransfer.files[0];

        handleImageSelection(file);
    }

);

// -----------------------------------
// Resize Mode
// -----------------------------------

resizeModeInput.addEventListener("change", () => {

    const mode = resizeModeInput.value;

    // Hide percentage by default
    percentageGroup.style.display = "none";


    // Percentage mode
    if (mode === "percentage") {

        percentageGroup.style.display = "block";

        widthInput.disabled = true;
        heightInput.disabled = true;

        return;
    }


    // Width only
    if (mode === "width") {

        widthInput.disabled = false;
        heightInput.disabled = true;

        aspectRatioCheckbox.checked = true;

        return;
    }


    // Height only
    if (mode === "height") {

        widthInput.disabled = true;
        heightInput.disabled = false;

        aspectRatioCheckbox.checked = true;

        return;
    }


    // Custom mode
    widthInput.disabled = false;
    heightInput.disabled = false;
});

// -----------------------------------
// Parcentage Calculation
// -----------------------------------
percentageInput.addEventListener("input", () => {

    if (resizeModeInput.value !== "percentage") {
        return;
    }

    const percentage =
        Number(percentageInput.value);

    if (
        !Number.isFinite(percentage) ||
        percentage <= 0
    ) {
        return;
    }

    let width =
        Math.round(
            originalWidth * percentage / 100
        );

    let height =
        Math.round(
            originalHeight * percentage / 100
        );


    // Maximum dimension
    if (
        width > MAX_DIMENSION ||
        height > MAX_DIMENSION
    ) {

        const scale =
            Math.min(
                MAX_DIMENSION / originalWidth,
                MAX_DIMENSION / originalHeight
            );

        width =
            Math.round(
                originalWidth * scale
            );

        height =
            Math.round(
                originalHeight * scale
            );
    }


    widthInput.value =
        width;

    heightInput.value =
        height;
});

// -----------------------------------
// Width Change
// -----------------------------------

widthInput.addEventListener("input", () => {

    if (!aspectRatioCheckbox.checked) {
        return;
    }

    let width =
        Number(widthInput.value);

    if (!width || !aspectRatio) {
        return;
    }

    // Maximum width
    if (width > MAX_DIMENSION) {

        width = MAX_DIMENSION;

        widthInput.value =
            width;
    }

    let height =
        Math.round(
            width / aspectRatio
        );

    // If calculated height exceeds maximum
    if (height > MAX_DIMENSION) {

        height = MAX_DIMENSION;

        width =
            Math.round(
                height * aspectRatio
            );

        widthInput.value =
            width;
    }

    heightInput.value =
        height;

});

// -----------------------------------
// Height Change
// -----------------------------------

heightInput.addEventListener("input", () => {

    if (!aspectRatioCheckbox.checked) {
        return;
    }

    let height =
        Number(heightInput.value);

    if (!height || !aspectRatio) {
        return;
    }

    // Maximum height
    if (height > MAX_DIMENSION) {

        height = MAX_DIMENSION;

        heightInput.value =
            height;
    }

    let width =
        Math.round(
            height * aspectRatio
        );

    // If calculated width exceeds maximum
    if (width > MAX_DIMENSION) {

        width = MAX_DIMENSION;

        height =
            Math.round(
                width / aspectRatio
            );

        heightInput.value =
            height;
    }

    widthInput.value =
        width;

});

// -----------------------------------
// Quality Slider
// -----------------------------------

qualityInput.addEventListener("input", () => {

    qualityValue.textContent =
        `${qualityInput.value}%`;

});

// -----------------------------------
// Resize Form Submit
// -----------------------------------

resizeForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        if (!selectedImage) {

            message.textContent =
                "Please select an image";

            return;
        }

        const resizeMode = resizeModeInput.value;
        const percentage = Number(percentageInput.value);

        let width =
            Number(widthInput.value);

        let height =
            Number(heightInput.value);

        const quality =
            Number(qualityInput.value);

        const maintainAspectRatio =
            aspectRatioCheckbox.checked;

        const format = formatInput.value;

        // -----------------------------------
        // Calculate Dimensions
        // -----------------------------------

        if (resizeMode === "percentage") {

            if (
                !Number.isFinite(percentage) ||
                percentage <= 0 ||
                percentage > 500
            ) {

                message.textContent =
                    "Percentage must be between 1 and 500";

                return;
            }

            width =
                Math.round(
                    originalWidth * percentage / 100
                );

            height =
                Math.round(
                    originalHeight * percentage / 100
                );
        }


        // -----------------------------------
        // Width Only
        // -----------------------------------

        if (resizeMode === "width") {

            width =
                Number(widthInput.value);

            if (
                !Number.isInteger(width) ||
                width <= 0
            ) {

                message.textContent =
                    "Please enter a valid width";

                return;
            }

            height =
                Math.round(
                    width / aspectRatio
                );
        }


        // -----------------------------------
        // Height Only
        // -----------------------------------

        if (resizeMode === "height") {

            height =
                Number(heightInput.value);

            if (
                !Number.isInteger(height) ||
                height <= 0
            ) {

                message.textContent =
                    "Please enter a valid height";

                return;
            }

            width =
                Math.round(
                    height * aspectRatio
                );
        }


        // -----------------------------------
        // Width Validation
        // -----------------------------------

        if (
            !Number.isInteger(width) ||
            width <= 0
        ) {

            message.textContent =
                "Please enter a valid width";

            return;
        }


        // -----------------------------------
        // Height Validation
        // -----------------------------------

        if (
            !Number.isInteger(height) ||
            height <= 0
        ) {

            message.textContent =
                "Please enter a valid height";

            return;
        }


        // -----------------------------------
        // Maximum Dimension Validation
        // -----------------------------------

        if (
            width > MAX_DIMENSION ||
            height > MAX_DIMENSION
        ) {

            message.textContent =
                `Width and height cannot be greater than ${MAX_DIMENSION}px`;

            return;
        }


        // -----------------------------------
        // Quality Validation
        // -----------------------------------

        if (
            !Number.isInteger(quality) ||
            quality < 1 ||
            quality > 100
        ) {

            message.textContent =
                "Quality must be between 1 and 100";

            return;
        }


        // -----------------------------------
        // Form Data
        // -----------------------------------

        const formData =
            new FormData();

        formData.append(
            "image",
            selectedImage
        );

        formData.append(
            "width",
            width
        );

        formData.append(
            "height",
            height
        );

        formData.append(
            "maintainAspectRatio",
            maintainAspectRatio
        );

        formData.append(
            "quality",
            quality
        );

        formData.append(
            "format",
            format
        );


        // -----------------------------------
        // API Request
        // -----------------------------------

        try {

            resizeButton.disabled = true;

            resizeButton.textContent =
                "Resizing...";

            message.textContent = "";

            result.innerHTML = "";

            resultInfo.innerHTML = "";


            const response =
                await fetch(
                    "/api/resize",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            // -----------------------------------
            // API Error
            // -----------------------------------

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Something went wrong";

                return;
            }


            // -----------------------------------
            // Success
            // -----------------------------------

            message.textContent =
                data.message;


            result.innerHTML = `
            <h3>Resized Image</h3>

            <img
                src="/output/${data.filename}"
                alt="Resized image"
            >

            <br>

            <a
                href="/output/${data.filename}"
                download
            >
                Download Image
            </a>
        `;


            resultInfo.innerHTML = `
            <p>
                <strong>Dimensions:</strong>
                ${data.width} × ${data.height}px
            </p>

            <p>
                <strong>Quality:</strong>
                ${data.quality}%
            </p>

            <p>
                <strong>Format:</strong>
                ${data.format.toUpperCase()}
            </p>

            <p>
                <strong>Aspect Ratio:</strong>
                ${(data.width / data.height).toFixed(2)}
            </p>

            ${data.fileSize
                    ? `
                        <p>
                            <strong>File size:</strong>
                            ${formatFileSize(data.fileSize)}
                        </p>
                    `
                    : ""
                }
        `;

        } catch (error) {

            console.error(error);

            message.textContent =
                "Something went wrong. Please try again.";

        } finally {

            resizeButton.disabled = false;

            resizeButton.textContent =
                "Resize Image";
        }
    }

);