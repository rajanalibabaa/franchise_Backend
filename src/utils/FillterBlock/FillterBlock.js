// utils/filterBlock.util.js
import { FilterBlock } from "../models/filterBlock.model.js";

let cachedBlock = null;
let cachedAt = 0;
const BLOCK_CACHE_TTL_MS = 60 * 1000; // 1 min — tune as needed

export const getBlockConfig = async () => {
  const now = Date.now();
  if (cachedBlock && now - cachedAt < BLOCK_CACHE_TTL_MS) {
    return cachedBlock;
  }

  const doc = await FilterBlock.findOne({ isActive: true }).lean();

  cachedBlock = doc || {
    headings: [],
    industries: [],
    categories: [],
    productTags: [],
    serviceTags: [],
  };
  cachedAt = now;

  return cachedBlock;
};

// Call this from your CMS update endpoint after saving changes,
// so the new rules apply immediately instead of waiting for TTL.
export const invalidateBlockCache = () => {
  cachedBlock = null;
  cachedAt = 0;
};