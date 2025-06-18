import Counter from "../model/Brand/Counter.js";

   const generateCustomId = async (group)=> {
  const counter = await Counter.findByIdAndUpdate(
    group,                                // _id is group (A, B, etc.)
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const numberPart = String(counter.seq).padStart(4, '0'); 
  // console.log`MRF-FMB-${group}${numberPart}` // 4-digit zero padding
  return `MrF-FB-${group}${numberPart}`;
}

 export default generateCustomId