import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

export const CounterModel = mongoose.model('Counter', CounterSchema);

export const generateSequenceId = async (key: string) => {
  const counter = await CounterModel.findOneAndUpdate(
    { key },
    { $inc: { value: 1 } },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );

  return counter!.value;
};
