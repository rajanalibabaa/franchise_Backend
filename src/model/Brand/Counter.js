import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: String,    // like 'A', 'B', etc.
  seq: {
    type: Number,
    default: 0
  }
});

 const Counter = mongoose.model('Counter', counterSchema);
export default Counter