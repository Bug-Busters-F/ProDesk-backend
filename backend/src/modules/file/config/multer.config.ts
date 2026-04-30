import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',

    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() +
        '-' +
        Math.round(Math.random() * 1e9);
      const extension =
        extname(file.originalname);
      const filename =
        `${uniqueSuffix}${extension}`;
      cb(null, filename);
    }
  }),

  limits: {
    fileSize: 10 * 1024 * 1024
  }
};