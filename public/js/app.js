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

let selectedImage = null;

let originalWidth = 0;
let originalHeight = 0;

let aspectRatio = 0;

const MAX_DIMENSION = 5000;

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
// Image Selection code
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
        `;

        URL.revokeObjectURL(imageUrl);
    };

    image.src = imageUrl;

    result.innerHTML = "";
    resultInfo.innerHTML = "";
    message.textContent = "";
};

imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];

        handleImageSelection(file);
    }
);

chooseImageButton.addEventListener(
    "click",
    () => {

        imageInput.click();
    }
);

dropZone.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        dropZone.classList.add(
            "drag-over"
        );
    }
);

dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "drag-over"
        );
    }
);

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
// Width Change
// -----------------------------------

widthInput.addEventListener("input", () => {

    if (!aspectRatioCheckbox.checked) {
        return;
    }

    let width = Number(widthInput.value);

    if (!width || !aspectRatio) {
        return;
    }

    // Maximum width
    if (width > MAX_DIMENSION) {
        width = MAX_DIMENSION;
        widthInput.value = width;
    }

    let height = Math.round(
        width / aspectRatio
    );

    // If calculated height exceeds maximum
    if (height > MAX_DIMENSION) {

        height = MAX_DIMENSION;

        width = Math.round(
            height * aspectRatio
        );

        widthInput.value = width;
    }

    heightInput.value = height;
});


// -----------------------------------
// Height Change
// -----------------------------------

heightInput.addEventListener("input", () => {

    if (!aspectRatioCheckbox.checked) {
        return;
    }

    let height = Number(heightInput.value);

    if (!height || !aspectRatio) {
        return;
    }

    // Maximum height
    if (height > MAX_DIMENSION) {
        height = MAX_DIMENSION;
        heightInput.value = height;
    }

    let width = Math.round(
        height * aspectRatio
    );

    // If calculated width exceeds maximum
    if (width > MAX_DIMENSION) {

        width = MAX_DIMENSION;

        height = Math.round(
            width / aspectRatio
        );

        heightInput.value = height;
    }

    widthInput.value = width;
});


// -----------------------------------
// Resize Form Submit
// -----------------------------------

resizeForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!selectedImage) {

        message.textContent =
            "Please select an image";

        return;
    }

    const width = Number(widthInput.value);
    const height = Number(heightInput.value);


    // Frontend validation
    if (!Number.isInteger(width) || width <= 0) {

        message.textContent =
            "Please enter a valid width";

        return;
    }


    if (!Number.isInteger(height) || height <= 0) {

        message.textContent =
            "Please enter a valid height";

        return;
    }


    if (
        width > MAX_DIMENSION ||
        height > MAX_DIMENSION
    ) {

        message.textContent =
            `Width and height cannot be greater than ${MAX_DIMENSION}px`;

        return;
    }


    const formData = new FormData();

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

    const quality = Number(qualityInput.value);
    formData.append("quality", quality);

    try {

        resizeButton.disabled = true;

        resizeButton.textContent =
            "Resizing...";

        message.textContent = "";

        result.innerHTML = "";


        const response = await fetch(
            "/api/resize",
            {
                method: "POST",
                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Something went wrong";

            return;
        }

        message.textContent = data.message;

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
                ${quality}%
            </p>

            <p>
                <strong>File size:</strong>
                ${formatFileSize(data.fileSize)}
            </p>
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
});

// -----------------------------------
// Quality Slider Submit
// -----------------------------------
qualityInput.addEventListener("input", () => {

    qualityValue.textContent =
        `${qualityInput.value}%`;
});