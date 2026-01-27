//creation of slugs to fields to add the fields find the brand name to pass to slugify

import mongoose from "mongoose";

import dotenv from "dotenv";
// import BrandDetails from "../models/BrandDetails.js";
import { BrandDetails } from "../src/model/Brand/Brand.model/BrandDetails.model.js";
dotenv.config({path:"./.env"});

const slugify = (text) => {
  if (!text || typeof text !== "string") return null;

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};
const run = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected");

    const brands = await BrandDetails.find(
      { "brandDetails.slug": { $exists: false } },
      { "brandDetails.brandName": 1 }
    );

    console.log(`🔍 Found ${brands.length} brands`);

    for (const brand of brands) {
  const brandName = brand.brandDetails?.brandName;
  const whatsappNumber = brand.brandDetails?.whatsappNumber;

  if (!brandName) {
    console.warn(
      `⚠ Skipping brand ${brand._id} (missing brandDetails.brandName)`
    );
    continue;
  }

  let baseSlug = slugify(brandName,whatsappNumber);

  if (!baseSlug) {
    console.warn(
      `⚠ Skipping brand ${brand._id} (invalid brandName)`
    );
    continue;
  }

  let slug = baseSlug;
  let count = 1;

  while (await BrandDetails.exists({ "brandDetails.slug": slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  await BrandDetails.updateOne(
    { _id: brand._id },
    { $set: { "brandDetails.slug": slug } }
  );

  console.log(`✔ ${brandName} → ${slug}`);
}


    console.log("🎉 Slug migration completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

run();
