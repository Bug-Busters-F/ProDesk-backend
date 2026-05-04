import { Schema, Document } from 'mongoose';

export interface FileDocument extends Document {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy?: string;
  createdAt?: Date;
}

export const FileSchema = new Schema(
  {
    filename: { type: String, required: true },
    originalname: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedBy: { type: String }
  },
  {
    timestamps: true
  }
);