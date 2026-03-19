import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cloudinary from "./cloudinaryConfig.js";

dotenv.config();

export const app = express();

app.use(cors());

app.use(express.json({ limit: "20mb" })); 

app.post('/api/uploadImages', async (req, resp) => {
    try {
        const { images } = req.body;
        if (!images || !Array.isArray(images)) {
            return resp.status(400).json({ serverMsg: "Nincsenek képek a kérésben!" });
        }

        const uploadPromises = images.map(img => 
            cloudinary.uploader.upload(img, { folder: "recipes" })
        );

        const results = await Promise.all(uploadPromises);

        const uploadedImages = results.map(res => ({
            url: res.secure_url,
            public_id: res.public_id
        }));

        resp.json({
            serverMsg: "Images uploaded successfully!",
            images: uploadedImages
        });

    } catch (error) {
        console.error("Cloudinary hiba:", error);
        resp.status(500).json({ serverMsg: "Upload failed!", error: error.message });
    }
});

app.post('/api/deleteImage', async (req, resp) => {
    try {
        const { public_id } = req.body;
        const deleteResult = await cloudinary.uploader.destroy(public_id);
        
        if (deleteResult.result === "ok") {
            resp.json({ serverMsg: "Image delete successful!" });
        } else {
            resp.status(400).json({ serverMsg: "Image not found or already deleted!" });
        }
    } catch (error) {
        console.error(error);
        resp.status(500).json({ serverMsg: "Failed to delete image!" });
    }
});

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`Server listening on port ${port}`));