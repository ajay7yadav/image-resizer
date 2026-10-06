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
// UI Message Helpers
// -----------------------------------
const showError = (text) => {
    message.className = "error";
    message.textContent = text;
};

const showSuccess = (text) => {
    message.className = "success";
    message.textContent = text;
};

const clearMessage = () => {
    message.className = "";
    message.textContent = "";
};

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
    if (!file) return;

    clearMessage();

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        showError("Only JPG, PNG and WebP images are allowed.");
        return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
        showError("Image size cannot be greater than 10 MB.");
        return;
    }

    selectedImage = file;
    const imageUrl = URL.createObjectURL(file);

    originalPreview.innerHTML = `
        <h3>Original Image</h3>
        <img src="${imageUrl}" alt="Original image">
    `;

    const image = new Image();
    image.onload = () => {
        originalWidth = image.width;
        originalHeight = image.height;
        aspectRatio = originalWidth / originalHeight;

        widthInput.value = originalWidth;
        heightInput.value = originalHeight;

        originalInfo.innerHTML = `
            <p><strong>Dimensions:</strong> ${originalWidth} × ${originalHeight}px</p>
            <p><strong>File size:</strong> ${formatFileSize(file.size)}</p>
            <p><strong>Format:</strong> ${file.type.split("/")[1].toUpperCase()}</p>
            <p><strong>Aspect Ratio:</strong> ${aspectRatio.toFixed(2)}</p>
        `;

        URL.revokeObjectURL(imageUrl);
    };

    image.src = imageUrl;

    result.innerHTML = "";
    resultInfo.innerHTML = "";
};

imageInput.addEventListener("change", () => {
    handleImageSelection(imageInput.files[0]);
});

chooseImageButton.addEventListener("click", () => {
    imageInput.click();
});

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    handleImageSelection(event.dataTransfer.files[0]);
});

// -----------------------------------
// Resize Mode & Calculations
// -----------------------------------
resizeModeInput.addEventListener("change", () => {
    const mode = resizeModeInput.value;
    percentageGroup.style.display = "none";

    if (mode === "percentage") {
        percentageGroup.style.display = "block";
        widthInput.disabled = true;
        heightInput.disabled = true;
        return;
    }

    if (mode === "width") {
        widthInput.disabled = false;
        heightInput.disabled = true;
        aspectRatioCheckbox.checked = true;
        return;
    }

    if (mode === "height") {
        widthInput.disabled = true;
        heightInput.disabled = false;
        aspectRatioCheckbox.checked = true;
        return;
    }

    widthInput.disabled = false;
    heightInput.disabled = false;
});

percentageInput.addEventListener("input", () => {
    if (resizeModeInput.value !== "percentage") return;

    const percentage = Number(percentageInput.value);
    if (!Number.isFinite(percentage) || percentage <= 0) return;

    let width = Math.round((originalWidth * percentage) / 100);
    let height = Math.round((originalHeight * percentage) / 100);

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = Math.min(MAX_DIMENSION / originalWidth, MAX_DIMENSION / originalHeight);
        width = Math.round(originalWidth * scale);
        height = Math.round(originalHeight * scale);
    }

    widthInput.value = width;
    heightInput.value = height;
});

widthInput.addEventListener("input", () => {
    if (!aspectRatioCheckbox.checked) return;

    let width = Number(widthInput.value);
    if (!width || !aspectRatio) return;

    if (width > MAX_DIMENSION) {
        width = MAX_DIMENSION;
        widthInput.value = width;
    }

    let height = Math.round(width / aspectRatio);
    if (height > MAX_DIMENSION) {
        height = MAX_DIMENSION;
        width = Math.round(height * aspectRatio);
        widthInput.value = width;
    }

    heightInput.value = height;
});

heightInput.addEventListener("input", () => {
    if (!aspectRatioCheckbox.checked) return;

    let height = Number(heightInput.value);
    if (!height || !aspectRatio) return;

    if (height > MAX_DIMENSION) {
        height = MAX_DIMENSION;
        heightInput.value = height;
    }

    let width = Math.round(height * aspectRatio);
    if (width > MAX_DIMENSION) {
        width = MAX_DIMENSION;
        height = Math.round(width / aspectRatio);
        heightInput.value = height;
    }

    widthInput.value = width;
});

qualityInput.addEventListener("input", () => {
    qualityValue.textContent = `${qualityInput.value}%`;
});

// -----------------------------------
// Resize Form Submit
// -----------------------------------
resizeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    if (!selectedImage) {
        showError("Please select an image first");
        return;
    }

    const resizeMode = resizeModeInput.value;
    const percentage = Number(percentageInput.value);
    let width = Number(widthInput.value);
    let height = Number(heightInput.value);
    const quality = Number(qualityInput.value);
    const maintainAspectRatio = aspectRatioCheckbox.checked;
    const format = formatInput.value;

    if (resizeMode === "percentage") {
        if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 500) {
            showError("Percentage must be between 1 and 500");
            return;
        }
        width = Math.round((originalWidth * percentage) / 100);
        height = Math.round((originalHeight * percentage) / 100);
    }

    if (resizeMode === "width") {
        width = Number(widthInput.value);
        if (!Number.isInteger(width) || width <= 0) {
            showError("Please enter a valid width");
            return;
        }
        height = Math.round(width / aspectRatio);
    }

    if (resizeMode === "height") {
        height = Number(heightInput.value);
        if (!Number.isInteger(height) || height <= 0) {
            showError("Please enter a valid height");
            return;
        }
        width = Math.round(height * aspectRatio);
    }

    if (!Number.isInteger(width) || width <= 0) {
        showError("Please enter a valid width");
        return;
    }

    if (!Number.isInteger(height) || height <= 0) {
        showError("Please enter a valid height");
        return;
    }

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        showError(`Width and height cannot be greater than ${MAX_DIMENSION}px`);
        return;
    }

    if (!Number.isInteger(quality) || quality < 10 || quality > 100) {
        showError("Quality must be between 1 and 100");
        return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("width", width);
    formData.append("height", height);
    formData.append("maintainAspectRatio", maintainAspectRatio);
    formData.append("quality", quality);
    formData.append("format", format);

    try {
        resizeButton.disabled = true;
        resizeButton.textContent = "Resizing...";
        clearMessage();
        result.innerHTML = "";
        resultInfo.innerHTML = "";

        const response = await fetch("/api/resize", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.message || "Failed to resize image");
            return;
        }

        const imageData = data.data;

        showSuccess(data.message || "Image resized successfully!");

        result.innerHTML = `
            <h3>Resized Image</h3>
            <img src="/output/${imageData.filename}" alt="Resized image">
            <br>
            <a href="/output/${imageData.filename}" download="${imageData.filename}">Download Image</a>
        `;

        resultInfo.innerHTML = `
            <p><strong>Dimensions:</strong> ${imageData.width} × ${imageData.height}px</p>
            <p><strong>Quality:</strong> ${imageData.quality}%</p>
            <p><strong>Format:</strong> ${imageData.format.toUpperCase()}</p>
            <p><strong>Aspect Ratio:</strong> ${(imageData.width / imageData.height).toFixed(2)}</p>
            ${imageData.fileSize ? `<p><strong>File size:</strong> ${formatFileSize(imageData.fileSize)}</p>` : ""}
            Size reduction: ${imageData.sizeReduction}%
        `;

    } catch (error) {
        console.error("Client error:", error);
        showError("Unable to reach the server. Please check your network connection.");
    } finally {
        resizeButton.disabled = false;
        resizeButton.textContent = "Resize Image";
    }
});