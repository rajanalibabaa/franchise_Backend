import {GetObjectCommand} from "@aws-sdk/client-s3"
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
import s3 from "./s3.js"

export const getPreSignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    })
    return await getSignedUrl(s3, command, {expiresIn:3600 })
}
