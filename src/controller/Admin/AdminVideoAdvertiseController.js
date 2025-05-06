import mongoose from "mongoose";
import { AdminVideoAdvertiseSchema } from "../../model/Admin/adminVideoAdvertiseModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";
import { uploadFileToS3 } from "../../utils/Uploads/s3Uploader.js";


const createAdminVideoAdvertise = async (req, res) => {

    try {
        const { title, description, } = req.body;
        console.log ("Request body:", req.body);

        if (!title || !description) {
             res.status(400).json(
                new ApiResponse(
                    400,
                    {},
                    "Title and description are required"
                )
             );
        }

        if  (!req.files || req.files.length === 0) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    {},
                    "Videos and thumbnail are required"
                )
            );
        }
        console.log("Request files:", req.files);

        const videosLocalPath = req.files?.videos[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

        if (!videosLocalPath || !thumbnailLocalPath) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    {},
                    "Videos and thumbnail are required"
                )
            );
        }

        const awsVideoUploadfiles = await uploadFileToS3(videosLocalPath, "videos")

        const awsThumbnailUploadfiles = await uploadFileToS3(thumbnailLocalPath, "thumbnail")
        console.log("AWS Video Upload URL:", awsVideoUploadfiles);
        console.log("AWS Thumbnail Upload URL:", awsThumbnailUploadfiles);


        const videoAdvertise = AdminVideoAdvertiseSchema.create({
            title: title,
            description: description,
            videoUrl: awsVideoUploadfiles,
            thumbnailUrl: awsThumbnailUploadfiles,
            uuid: uuid(),
        })  

        if (!videoAdvertise) {
            return res.status(500).json(
                new ApiResponse(
                    500,
                    {},
                    "Failed to create video advertisement"
                )
            );
            
        }

        console.log("Video Advertisement Created:", videoAdvertise);
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
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
        const videoAdvertise = await AdminVideoAdvertiseSchema.find().sort({ updatedAt: -1 });
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
    const { videoIds } = req.body;
    

    try {
        const videoAdvertises = await AdminVideoAdvertiseSchema.find({ uuid: { $in: videoIds } });

        console.log("Video Advertise Results:", videoAdvertises);
        return res.status(200).json(videoAdvertises);
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAdminVideoAdvertiseTopTwo  = async (req, res) => {
    const { videoIds } = req.body;
   
    try {
        const videoAdvertises = await AdminVideoAdvertiseSchema.find({ uuid: { $in: videoIds } });

        console.log("Video Advertise Results:", videoAdvertises);
        return res.status(200).json(videoAdvertises);
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAdminVideoAdvertiseTopThree  = async (req, res) => {
    const { videoIds } = req.body;
    
    try {
        const videoAdvertises = await AdminVideoAdvertiseSchema.find({ uuid: { $in: videoIds } });

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