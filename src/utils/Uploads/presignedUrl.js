import {GetObjectCommand} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import s3 from "./s3.js"
import dotenv from "dotenv"
dotenv.config()

const DEFAULT_EXPIRATION = 3600 // 1 hour in seconds
//singlr file
export const generatePresignedUrl = async (key,expriesIn = DEFAULT_EXPIRATION   ) => {
   if(!key || typeof key !== "string" || key.trim() === ""){
    console.log("invlid s3 key passed");
    return null
   } 
   try {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });
    return await getSignedUrl(s3, command, {  expriesIn });
   } catch (error) {
    console.log(`Error generating presigned URL${key}`, error.message);
    return null
    
   }
}

//multiple files

export const generatePresignedUrls = async (keys, expriesIn = DEFAULT_EXPIRATION) => {
    if(!Array.isArray(keys)){
        console.log("keys must be an array");
        return []
    } 
    const validKeys = keys.filter(key =>key && typeof key === "string" && key.trim() !== "");
return Promise.all(validKeys.map(async(key)=>({
    key,
    url: await generatePresignedUrl(key,expriesIn)
})))
}


export const generatePresignedUrlBrands = async(brand,expiresIn=DEFAULT_EXPIRATION) =>{
    if(!brand || typeof brand !== "object"){
        console.log("brand must be an object");
      return null  
    } 

    //copy of the brand aviod modified the original url
    const brandWithUrls = JSON.parse(JSON.stringify(brand));

try {
    if(brandWithUrls.Documentation){
        const documentationEntries = Object.entries(brandWithUrls.Documentation);
        await Promise.all(
            documentationEntries.map(async([name,value])=>{
                 brandWithUrls.Documentation[name] = await generatePresignedUrl(value,expiresIn)
            })
        )
    }
    if(brandWithUrls.Gallery?.mediaFiles?.length>0){
        brandWithUrls.Gallery.mediaFiles =await Promise.all(brandWithUrls.Gallery.mediaFiles.map(
            fileKey=>generatePresignedUrl(fileKey,expiresIn)
        ))
        return brandWithUrls
    }
} catch (error) {
    console.log("error generating presigned url for brand",error.message);
    return brand
    
    
}
   

    //gallery files

}