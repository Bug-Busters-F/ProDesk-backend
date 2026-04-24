export class FileEntity {
  id?: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy?: string;
  createdAt?: Date;
}