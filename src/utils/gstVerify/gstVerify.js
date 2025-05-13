import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const gstVerify = express.Router();

const KNOW_YOUR_GST_API = "https://www.knowyourgst.com/api/gst-search";
const API_KEY = process.env.KNOW_YOUR_GST_API_KEY;

gstVerify.get('/:gstNumber', async (req, res) => {
    const gstNumber = req.params.gstNumber;

    // Validate GST number format
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
    if (!gstRegex.test(gstNumber)) {
        return res.status(400).json({ error: "Invalid GST number format" });
    }

    try {
        const response = await axios.get(`${KNOW_YOUR_GST_API}?auth_token=${API_KEY}&gst=${gstNumber}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
                "Accept": "application/json"
            },
        });
        const data = response.data;

        if (data.error) {
            return res.status(400).json({ error: data.error });
        }

        res.json(data);
    } catch (error) {
        console.error("Error verifying GST number:", error.message);

        if (error.response) {
            const contentType = error.response.headers['content-type'];
            if (contentType && contentType.includes('text/html')) {
                console.error("Received HTML response instead of JSON:", error.response.data);
                return res.status(500).json({ error: "Unexpected response from the API. Please check the API endpoint or key." });
            }

            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);
            return res.status(error.response.status).json({ error: error.response.data });
        }

        res.status(500).json({ error: "An internal server error occurred" });
    }
});

export default gstVerify;
