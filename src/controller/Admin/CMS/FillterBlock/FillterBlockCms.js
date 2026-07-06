// controllers/filterBlock.controller.js
import { FilterBlock } from "../../../../model/CMS/FillterBlock/FillterBlock.js";
import { invalidateBlockCache } from "../../../../utils/FillterBlock/FillterBlock.js";


const toStringArray = (val) =>
  Array.isArray(val) ? val.filter((v) => typeof v === "string" && v.trim()) : [];

// Normalizes [{ parent, tags: [] }] shape used by productTags/serviceTags
const normalizeParentTagBlocks = (val) => {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item) => item && typeof item.parent === "string" && item.parent.trim())
    .map((item) => ({
      parent: item.parent.trim(),
      tags: toStringArray(item.tags),
    }));
};

// Merge incoming {parent, tags} groups into an existing array (used on checkbox TICK)
const mergeParentTagBlocks = (existing = [], incoming) => {
  const normalizedIncoming = normalizeParentTagBlocks(incoming);
  const result = [...existing];

  normalizedIncoming.forEach(({ parent, tags }) => {
    const idx = result.findIndex((g) => g.parent === parent);
    if (idx === -1) {
      result.push({ parent, tags });
    } else {
      result[idx] = {
        parent,
        tags: Array.from(new Set([...result[idx].tags, ...tags])),
      };
    }
  });

  return result;
};

// Remove incoming {parent, tags} groups from an existing array (used on checkbox UNTICK)
// If `tags` is empty/omitted for a parent, the whole parent group is removed.
const removeParentTagBlocks = (existing = [], incoming) => {
  if (!Array.isArray(incoming)) return existing;

  let result = [...existing];

  incoming.forEach((item) => {
    if (!item || typeof item.parent !== "string") return;
    const parent = item.parent.trim();
    const tagsToRemove = toStringArray(item.tags);

    if (tagsToRemove.length === 0) {
      // no specific tags -> drop the entire parent group
      result = result.filter((g) => g.parent !== parent);
    } else {
      const idx = result.findIndex((g) => g.parent === parent);
      if (idx !== -1) {
        const remainingTags = result[idx].tags.filter(
          (t) => !tagsToRemove.includes(t)
        );
        if (remainingTags.length === 0) {
          result.splice(idx, 1);
        } else {
          result[idx] = { parent, tags: remainingTags };
        }
      }
    }
  });

  return result;
};

// ═══════════════════════════════════════════════════════════
// GET /filter-block  → fetch current blocked config (for checkbox states)
// ═══════════════════════════════════════════════════════════

export const getFilterBlock = async (req, res) => {
  try {
    const name = req.query.name || "default";

    const doc = await FilterBlock.findOne({ name });

    return res.status(200).json({
      success: true,
      data: doc || {
        name,
        isActive: true,
        headings: [],
        industries: [],
        categories: [],
        productTags: [],
        serviceTags: [],
      },
    });
  } catch (error) {
    console.error("❌ getFilterBlock error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch filter block config",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// PATCH /filter-block/update  → checkbox TICKED = add to blocklist
// Body: { name?, headings?: [], industries?: [], categories?: [],
//         productTags?: [{parent, tags}], serviceTags?: [{parent, tags}] }
// ═══════════════════════════════════════════════════════════

export const updateFilterBlock = async (req, res) => {
  try {
    const {
      name = "default",
      headings,
      industries,
      categories,
      productTags,
      serviceTags,
    } = req.body;

    let doc = await FilterBlock.findOne({ name });
    if (!doc) {
      doc = new FilterBlock({ name });
    }

    if (headings) {
      doc.headings = Array.from(new Set([...doc.headings, ...toStringArray(headings)]));
    }
    if (industries) {
      doc.industries = Array.from(new Set([...doc.industries, ...toStringArray(industries)]));
    }
    if (categories) {
      doc.categories = Array.from(new Set([...doc.categories, ...toStringArray(categories)]));
    }
    if (productTags) {
      doc.productTags = mergeParentTagBlocks(doc.productTags, productTags);
    }
    if (serviceTags) {
      doc.serviceTags = mergeParentTagBlocks(doc.serviceTags, serviceTags);
    }

    await doc.save();
    invalidateBlockCache();

    return res.status(200).json({
      success: true,
      message: "Item(s) added to filter block",
      data: doc,
    });
  } catch (error) {
    console.error("❌ updateFilterBlock error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update filter block config",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// PATCH /filter-block/remove  → checkbox UNTICKED = remove from blocklist
// Body: { name?, headings?: [], industries?: [], categories?: [],
//         productTags?: [{parent, tags}], serviceTags?: [{parent, tags}] }
// ═══════════════════════════════════════════════════════════

export const removeFilterBlock = async (req, res) => {
  try {
    const {
      name = "default",
      headings,
      industries,
      categories,
      productTags,
      serviceTags,
    } = req.body;

    const doc = await FilterBlock.findOne({ name });
    if (!doc) {
      // nothing to remove — treat as a no-op success rather than an error
      return res.status(200).json({
        success: true,
        message: `No filter block config found for name "${name}", nothing to remove`,
        data: null,
      });
    }

    if (headings) {
      const toRemove = new Set(toStringArray(headings));
      doc.headings = doc.headings.filter((h) => !toRemove.has(h));
    }
    if (industries) {
      const toRemove = new Set(toStringArray(industries));
      doc.industries = doc.industries.filter((i) => !toRemove.has(i));
    }
    if (categories) {
      const toRemove = new Set(toStringArray(categories));
      doc.categories = doc.categories.filter((c) => !toRemove.has(c));
    }
    if (productTags) {
      doc.productTags = removeParentTagBlocks(doc.productTags, productTags);
    }
    if (serviceTags) {
      doc.serviceTags = removeParentTagBlocks(doc.serviceTags, serviceTags);
    }

    await doc.save();
    invalidateBlockCache();

    return res.status(200).json({
      success: true,
      message: "Item(s) removed from filter block",
      data: doc,
    });
  } catch (error) {
    console.error("❌ removeFilterBlock error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove from filter block config",
    });
  }
};