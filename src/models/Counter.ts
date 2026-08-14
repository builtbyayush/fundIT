import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ICounter {
  key: string;
  seq: number;
}

export interface ICounterDocument extends ICounter, Document {}

export type ICounterModel = Model<ICounterDocument>;

const counterSchema = new Schema<ICounterDocument, ICounterModel>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, required: true, default: 0 },
});

export const Counter =
  (mongoose.models.Counter as ICounterModel | undefined) ??
  mongoose.model<ICounterDocument, ICounterModel>("Counter", counterSchema);

export async function getNextSequence(key: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return doc.seq;
}
