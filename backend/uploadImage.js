// utils/uploadImage.js
import cloudinary from "./cloudinary.js";

/**
 * Upload an image buffer or local file path to Cloudinary.
 * @param {Buffer|string} file - Either a buffer (e.g., from multer.memoryStorage()) or file path.
 * @param {string} [folder="uploads"] - Optional folder name.
 * @returns {Promise<string>} - The secure Cloudinary URL.
 */
export async function uploadImage(file, folder = "uploads") {
    try {
        const result = await new Promise((resolve, reject) => {
            const options = { folder, resource_type: "auto" };

            if (Buffer.isBuffer(file)) {
                const stream = cloudinary.uploader.upload_stream(options, (err, res) =>
                    err ? reject(err) : resolve(res)
                );
                stream.end(file);
            } else {
                cloudinary.uploader.upload(file, options, (err, res) =>
                    err ? reject(err) : resolve(res)
                );
            }
        });

        return result.secure_url;
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        throw new Error("Failed to upload image");
    }
}
