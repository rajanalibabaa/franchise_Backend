import mongoose from "mongoose";
import { AdminVideoAdvertiseSchema } from "../../model/Admin/adminVideoAdvertiseModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";


const createAdminVideoAdvertise = async (req, res) => {

    try {
        const { title, description, videoUrl, thumbnailUrl,  } = req.body;
        console.log ("Request body:", req.body);
    
        // Validate input
        if (!title || !description || !videoUrl ) {
            console.error("Validation error: All fields are required");
        return res.status(400).json({ message: "All fields are required" });
        }
    
        // Create new video advertisement
        const newVideoAdvertise = await AdminVideoAdvertiseSchema.create({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        uuid: uuid()
        });

        console.log("New video advertisement created:", newVideoAdvertise);
    
        return res.status(201).json(
            new ApiResponse(
                201,
                newVideoAdvertise,
                "Video advertisement created successfully"
            )
        );
    } catch (error) {
        console.error("Error creating video advertisement:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAdminVideoAdvertise = async (req, res) => {
    try {
        const videoAdvertise = await AdminVideoAdvertiseSchema.find();
        return res.status(200).json(
            new ApiResponse(
                200,
                videoAdvertise,
                "Video advertisements fetched successfully"
            )
        );
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAdminVideoAdvertiseTopOne = async (req, res) => {
    const { uuids } = req.body;
    console.log("UUIDs from request body:", typeof(uuids), uuids);

    try {
        const videoAdvertises = await AdminVideoAdvertiseSchema.find({ uuid: { $in: uuids } });

        console.log("Video Advertise Results:", videoAdvertises);
        return res.status(200).json(videoAdvertises);
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAdminVideoAdvertiseTopTwo  = async (req, res) => {
    const { uuids } = req.body;
    console.log("UUIDs from request body:", typeof(uuids), uuids);

    try {
        const videoAdvertises = await AdminVideoAdvertiseSchema.find({ uuid: { $in: uuids } });

        console.log("Video Advertise Results:", videoAdvertises);
        return res.status(200).json(videoAdvertises);
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAdminVideoAdvertiseTopThree  = async (req, res) => {
    const { uuids } = req.body;
    console.log("UUIDs from request body:", typeof(uuids), uuids);

    try {
        const videoAdvertises = await AdminVideoAdvertiseSchema.find({ uuid: { $in: uuids } });

        console.log("Video Advertise Results:", videoAdvertises);
        return res.status(200).json(videoAdvertises);
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export {
    createAdminVideoAdvertise,
    getAdminVideoAdvertise,
    getAdminVideoAdvertiseTopOne,
    getAdminVideoAdvertiseTopTwo,
    getAdminVideoAdvertiseTopThree,
}