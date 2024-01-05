import { HttpException, HttpStatus } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import fs from 'fs';
import moment from "moment";
import { diskStorage } from "multer";
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export const multerOptions = (): MulterOptions => ({
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB in bytes
    },
    storage: diskStorage({
        destination: function (req, file, cb) {
            const filePath = `./public/upload/temp`;
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, { recursive: true });
            }
            cb(null, filePath);
        },
        filename: (req: any, file: any, cb: any) => {
            cb(null, `${moment().unix()}-${uuid()}${extname(file.originalname)}`);
        },

    }),
    fileFilter: (req: any, file: any, cb: any) => {
        checkMimeTypeCallback(file, cb);
    },
});

function generateFilename(file) {
    return `${Date.now()}.${extname(file.originalname)}`;
}

function checkMimeTypeCallback(file, cb) {
    const filetypes = /jpg|jpeg|png|gif|bmp/;
    const mimetype = filetypes.test(file.mimetype);
    const checkExtname = filetypes.test(extname(file.originalname));
    if (mimetype && checkExtname) {
        return cb(null, true);
    }

    cb(
        new HttpException(
            {
                result: false,
                message: `Unsupported file type ${extname(file.originalname)}`,
                data: null,
            },
            HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        ),
        false,
    );
}