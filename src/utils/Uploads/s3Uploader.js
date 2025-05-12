import fs from 'fs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from './s3.js';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';

export const uploadFileToS3 = async (file) => {

    const fileContent = fs.readFileSync(file)
    const fileName = path.basename(file); // Extract the file name from the path
    const fileKey = `${Date.now()}-${fileName}`; 

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: fileContent,
        ContentType: file.mimetype,
    });

    try {
        await s3.send(command);
        console.log(`File uploaded successfully. ${fileKey}`);
        fs.unlinkSync(file)
        return  `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (err) {
        console.error('Error uploading file:', err);
        throw new Error('Failed to upload file to S3');
    } finally{
        //  fs.unlinkSync(file)
    }


}