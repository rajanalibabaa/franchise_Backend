import FranchiseBrand from "../../model/Brand/brandListingPage.js";
import {ApiResponse} from "../../utils/ApiResponse/ApiResponse.js";
import { uploadFileToS3 } from "../../utils/Uploads/s3Uploader.js";

const createBrandListing = async (req, res) => {
    try {

        const {submissionData} = req.body

        console.log(req.body)

//         const localbrandLogo = req.files?.brandLogo[0]?.path;
//   console.log(localbrandLogo)
//         const localbusinessRegistration = req.files?.businessRegistration[0]?.path;


//         const localgstCertificate =await req.files?.gstCertificate[0]?.path;
//         const localfranchiseAgreement =await req.files?.franchiseAgreement[0]?.path;
//         const localmenuCatalog =await req.files?.menuCatalog[0]?.path;
//         const localinteriorPhotos =await req.files?.interiorPhotos[0]?.path;
//         const localfssaiLicense =await req.files?.fssaiLicense[0]?.path;
//         const localpanCard =await req.files?.panCard[0]?.path;
//         const localaadhaarCard =await req.files?.aadhaarCard[0]?.path;

//         if (!localbrandLogo || !localbusinessRegistration ||!localgstCertificate ||!localfranchiseAgreement ||!localmenuCatalog ||!localinteriorPhotos ||!localfssaiLicense ||!localpanCard ||!localaadhaarCard ) {
//                 return res.status(400).json(
//                   new ApiResponse(
//                     400,
//                     null,
//                     "All documents files are required"
//                   )
//                 );
//               }

//         const arr = [localbrandLogo,localbusinessRegistration,localgstCertificate, localfranchiseAgreement, localmenuCatalog, localinteriorPhotos,localfssaiLicense, localpanCard, localaadhaarCard]

//         console.log("=== : ",arr)
//         const awsUplodedlocalbrandLogo =  await uploadFileToS3(localbrandLogo)

//         const awsUplodedlocalbusinessRegistration =  await uploadFileToS3(localbusinessRegistration)

//         const awsUplodedlocalgstCertificate =  await uploadFileToS3(localgstCertificate)

//         const awsUplodedlocalfranchiseAgreement =  await uploadFileToS3(localfranchiseAgreement)

//         const awsUplodedlocalmenuCatalog =  await uploadFileToS3(localmenuCatalog)

//         const awsUplodedlocalinteriorPhotos =  await uploadFileToS3(localinteriorPhotos)

//         const awsUplodedlocalfssaiLicense =  await uploadFileToS3(localfssaiLicense)
//         const awsUplodedlocalpanCard =  await uploadFileToS3(localpanCard)
//         const awsUplodedlocalaadhaarCard =  await uploadFileToS3(localaadhaarCard)


//         if (!awsUplodedlocalbrandLogo || !awsUplodedlocalbusinessRegistration ||!awsUplodedlocalgstCertificate ||!awsUplodedlocalaadhaarCard ||!awsUplodedlocalfranchiseAgreement ||!awsUplodedlocalmenuCatalog ||!awsUplodedlocalinteriorPhotos ||!awsUplodedlocalfssaiLicense ||!awsUplodedlocalpanCard ) {
//             return res.status(400).json(
//               new ApiResponse(
//                 400,
//                 null,
//                 "All documents files are required"
//               )
//             );
//           }

  

//       const mediaFiles = req.files?.Gallery?.map(file => file.path) || [];
      
//       if (!mediaFiles || mediaFiles.length === 0) {
//         return res.status(400).json(
//           new ApiResponse(
//             400,
//             null,
//             "Media files are required"
//           )
//         );
//       }
  
//       const uploadedS3Urls = [];

//     for (const filePath of mediaFiles) {

//     const url = await uploadFileToS3(filePath);
//     // console.log("=========:",url)
//     uploadedS3Urls.push(url);
//     }

//       const newBrand = new FranchiseBrand({
       
//         Documentation :{
//             brandLogo: awsUplodedlocalbrandLogo,
//             businessRegistration: awsUplodedlocalbusinessRegistration,
//             gstCertificate: awsUplodedlocalgstCertificate,
//             franchiseAgreement: awsUplodedlocalfranchiseAgreement,
//             menuCatalog: awsUplodedlocalmenuCatalog,
//             interiorPhotos: awsUplodedlocalinteriorPhotos,
//             fssaiLicense: awsUplodedlocalfssaiLicense,
//             panCard: awsUplodedlocalpanCard,
//             aadhaarCard: awsUplodedlocalaadhaarCard,
//         },
//     Gallery: {
//         mediaFiles: uploadedS3Urls  
//       }
//       });
  
//       await newBrand.save();
  
//       return res.status(201).json(
//         new ApiResponse(201, newBrand, "Brand created successfully")
//       );
  
    } catch (error) {
      console.error("Error creating brand:", error);
      return res.status(500).json({
        error: "Failed to create brand",
        details: error.message
      });
    }
  };
  

const getAllBrands = async (req, res) => {
    try {
        const brands = await FranchiseBrand.find({});
        res.status(200).json(
            new ApiResponse(
                200,
                brands,
                "Brands fetched successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch brands", details: error.message });
    }
}

const getBrandById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const brand = await FranchiseBrand.findById(id);
        if (!brand) {
            return res.status(404).json({ error: "Brand not found" });
        }
        res.status(200).json(
            new ApiResponse(
                200,
                brand,
                "Brand fetched successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch brand", details: error.message });
    }
}

const updateBrand = async (req, res) => {
    const { id } = req.params;
    const { BrandDetails, ExpansionPlans, FranchiseModal, Documentation  } = req.body;
    console.log ("Brand data:", BrandDetails);

    try {
        const updatedBrand = await FranchiseBrand.findByIdAndUpdate(id, {
            
            BrandDetails : {
                ...BrandDetails,
            },
            ExpansionPlans : {
                ...ExpansionPlans,
            },
            FranchiseModal : {
                ...FranchiseModal,
            },
            Documentation : {
                ...Documentation,
            },
        }, { new: true });

        if (!updatedBrand) {
            return res.status(404).json({ error: "Brand not found" });
        }

        res.status(200).json(
            new ApiResponse(
                200,
                updatedBrand,
                "Brand updated successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to update brand", details: error.message });
    }
}

const updateBrandImage = async (req, res) => {
    const { id } = req.params;
    console.log("Image URL:", id);
}
const deleteBrand = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBrand = await FranchiseBrand.findByIdAndDelete(id);

        if (!deletedBrand) {
            return res.status(404).json({ error: "Brand not found" });
        }

        res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Brand deleted successfully",
            )
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to delete brand", details: error.message });
    }
}


export { 
    createBrandListing,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    updateBrandImage
 };