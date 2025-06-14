

async function generateCustomId(group) {
  const counter = await Counter.findByIdAndUpdate(
    group,                                // _id is group (A, B, etc.)
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const numberPart = String(counter.seq).padStart(4, '0');  // 4-digit zero padding
  return `MRF-FMB-${group}${numberPart}`;
}