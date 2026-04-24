import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

export const profileMulterConfig = {
  storage: diskStorage({
    destination: (req: any, file, cb) => {
      const userId = req.user?.id || 'temp';
      const path = `./uploads/profile/${userId}`;

      fs.mkdirSync(path, { recursive: true });

      cb(null, path);
    },

    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      const extension = extname(file.originalname);

      cb(null, `${uniqueSuffix}${extension}`);
    },
  }),

  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },

  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!allowed.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          'Only image files (jpg, jpeg, png) are allowed',
        ),
        false,
      );
    }

    cb(null, true);
  },
};