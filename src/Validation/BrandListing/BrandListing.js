import Joi from 'joi';

export const brandListingSchema = Joi.object({
    companyName: Joi.string().required(),
    brandName: Joi.string().required(),
    category: Joi.object({
        main: Joi.string().required(),
        sub: Joi.string().required(),
    }).required(),
    ownerName: Joi.string().required(),
    aboutCompany: Joi.string().required(),
    address: Joi.string().required(),
    country: Joi.string().required(),
    pincode: Joi.string().required(),
    location: Joi.object({
        state: Joi.string().required(),
        district: Joi.string().required(),
        city: Joi.string().required(),
    }).required(),
    mobileNumber: Joi.string().required(),
    whatsAppNumber: Joi.string().required(),
    email: Joi.string().email().required(),
    website: Joi.object({
        officalWebsite: Joi.string().uri().required(),
        facebook: Joi.string().uri().required(),
        instagram: Joi.string().uri().required(),
        linkedIn: Joi.string().uri().required(),
        twitter: Joi.string().uri().required(),
        youtube: Joi.string().uri().required(),
    }).required(),
    eastablishYear: Joi.string().required(),
    franchising: Joi.string().required(),
    expansions: Joi.object({
        interNational: Joi.string().required(),
        domestic: Joi.string().required(),
    }).required(),
    investment: Joi.string().required(),
    franchiseFee: Joi.string().required(),
    royalityFee: Joi.string().required(),
    equipmentCost: Joi.string().required(),
    expectMonthlyRevenue: Joi.string().required(),
    expectMonthlyProfit: Joi.string().required(),
    PayBackPeriod: Joi.string().required(),
    spaceRequired: Joi.string().required(),
    training: Joi.string().required(),
    minumuminvestment: Joi.string().required(),
    companyownoutlet: Joi.string().required(),
    franchiseoutlet: Joi.string().required(),
    totalOutlet: Joi.string().required(),
    targetcitiesExpansion: Joi.string().required(),
    targetstatesExpansion: Joi.string().required(),
    paymentterms: Joi.string().required(),
    brandLogo: Joi.string().required(),
    brandImage: Joi.string().required(),
    brandVideo: Joi.string().required(),
    aadharimgae: Joi.string().required(),
    panImage: Joi.string().required(),
    gstImage: Joi.string().required(),
    companyRegistrationImage: Joi.string().required(),
    menuCatalogImage: Joi.string().required(),
    interiorImage: Joi.string().required(),
    galleryImage: Joi.string().required(),
    otpVerified: Joi.object({
        mobile: Joi.boolean().default(false),
        email: Joi.boolean().default(false),
        whatsApp: Joi.boolean().default(false),
    }).default({ mobile: false, email: false, whatsApp: false }),
});