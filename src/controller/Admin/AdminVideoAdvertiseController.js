
import { AdminVideoAdvertiseSchema } from "../../model/Admin/adminVideoAdvertiseModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";
import { uploadFileToS3 } from "../../utils/Uploads/s3Uploader.js";
import BrandListing from "../../model/Brand/brandListingPage.js";


const createAdminVideoAdvertise = async (req, res) => {
    try {
        const { title, description } = req.body;
        console.log("Request body:", req.body);

        // Validate input
        if (!title || !description) {
            return res.status(400).json(
                new ApiResponse(400, {}, "Title and description are required")
            );
        }

        // Validate files
        if (!req.files || !req.files.videos || !req.files.thumbnail) {
            return res.status(400).json(
                new ApiResponse(400, {}, "Videos and thumbnail are required")
            );
        }

        console.log("Request files:", req.files);

        const videoFile = req.files.videos[0];
        const thumbnailFile = req.files.thumbnail[0];

        const videosLocalPath = videoFile?.path;
        const thumbnailLocalPath = thumbnailFile?.path;

        if (!videosLocalPath || !thumbnailLocalPath) {
            return res.status(400).json(
                new ApiResponse(400, {}, "Videos and thumbnail are required")
            );
        }

        // Upload files to S3
        const awsVideoUploadUrl = await uploadFileToS3(videosLocalPath, videoFile.mimetype);
        const awsThumbnailUploadUrl = await uploadFileToS3(thumbnailLocalPath, thumbnailFile.mimetype);

        console.log("AWS Video Upload URL:", awsVideoUploadUrl);
        console.log("AWS Thumbnail Upload URL:", awsThumbnailUploadUrl);

        // Create DB entry
        const videoAdvertise = await AdminVideoAdvertiseSchema.create({
            title,
            description,
            videoUrl: awsVideoUploadUrl,
            thumbnailUrl: awsThumbnailUploadUrl,
            uuid: uuid(),
        });

        if (!videoAdvertise) {
            return res.status(500).json(
                new ApiResponse(500, {}, "Failed to create video advertisement")
            );
        }

        console.log("Video Advertisement Created:", videoAdvertise);
        return res.status(200).json(
            new ApiResponse(200, videoAdvertise, "Video advertisement created successfully")
        );

    } catch (error) {
        console.error("Error creating video advertisement:", error);
        return res.status(500).json(
            new ApiResponse(500, {}, "Internal server error")
        );
    }
};


const getAdminVideoAdvertise = async (req, res) => {
    try {
        const videoAdvertise = await AdminVideoAdvertiseSchema.find().sort({ updatedAt: -1 }).select("-__v -_id");
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

let TopVideoAdvertises = [];

const postAdminVideoAdvertiseTopOne = async (req, res) => {
    const { videoIds } = req.body;
    

    try {
         const adminAds = await AdminVideoAdvertiseSchema.find({ uuid: { $in: videoIds } }).select("-__v -_id");

        const brandAds = await BrandListing.find({ uuid: { $in: videoIds } }).select("-__v -_id");

        TopVideoAdvertises = [...adminAds, ...brandAds];
        // console.log("Video Advertise Results:", TopVideoAdvertises);
        return res.status(200).json(
            new ApiResponse(200,TopVideoAdvertises,"Top one video advertisement fetch successfully")
        );
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAdminVideoAdvertiseTopOne  = async (req, res) => {
    
    try {

        return res.status(200).json(
            new ApiResponse(
                200,
                TopVideoAdvertises,
                "Top video advertisements fetched successfully"
            )
        );
        
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

let TopTwoVideoAdvertises = [];
const postAdminVideoAdvertiseTopTwo  = async (req, res) => {
    const { videoIds } = req.body;
   
    try {
         const adminAds = await AdminVideoAdvertiseSchema.find({ uuid: { $in: videoIds } }).select("-__v -_id");

        const brandAds = await BrandListing.find({ uuid: { $in: videoIds } }).select("-__v -_id");

        TopTwoVideoAdvertises = [...adminAds, ...brandAds];

        console.log("Video Advertise Results:", TopTwoVideoAdvertises);
        return res.status(200).json(
            new ApiResponse(200,TopTwoVideoAdvertises,"Top two video advertisement fetch successfully")
        );
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAdminVideoAdvertiseTopTwo  = async (req, res) => {
    
    try {

        return res.status(200).json(
            new ApiResponse(
                200,
                TopTwoVideoAdvertises,
                "Top video advertisements fetched successfully"
            )
        );
        
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}


let TopThreeVideoAdvertises = [];
const postAdminVideoAdvertiseTopThree  = async (req, res) => {
    const { videoIds } = req.body;
    
    try {
         const adminAds = await AdminVideoAdvertiseSchema.find({ uuid: { $in: videoIds } }).select("-__v -_id");

        const brandAds = await BrandListing.find({ uuid: { $in: videoIds } }).select("-__v -_id");

        TopThreeVideoAdvertises = [...adminAds, ...brandAds];
        return res.status(200).json(
            new ApiResponse(200,TopThreeVideoAdvertises,"Top three video advertisement fetch successfully")
        );
    } catch (error) {
        console.error("Error fetching video advertisements:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAdminVideoAdvertiseTopThree  = async (req, res) => {
    
    try {

        return res.status(200).json(
            new ApiResponse(
                200,
                TopThreeVideoAdvertises,
                "Top video advertisements fetched successfully"
            )
        );
        
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

    postAdminVideoAdvertiseTopOne,
    postAdminVideoAdvertiseTopTwo,
    postAdminVideoAdvertiseTopThree
}