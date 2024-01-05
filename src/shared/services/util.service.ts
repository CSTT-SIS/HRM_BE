import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv } from 'crypto';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '~/common/constants/constant';
import { MEDIA_TYPE } from '~/common/enums/enum';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';

@Injectable()
export class UtilService {
    constructor(private readonly dataSource: DataSource) {}

    public capitalizeFirstLetter(str: string) {
        if (!str) return null;
        str = str.toLowerCase();
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    public generateString(length = 16) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    public getSortCondition(
        entityAlias: string,
        sortBy: string,
    ): { [key: string]: 'ASC' | 'DESC' | { order: 'ASC' | 'DESC'; nulls?: 'NULLS FIRST' | 'NULLS LAST' } } {
        entityAlias = entityAlias ? `${entityAlias}.` : '';
        if (!sortBy) return { [`${entityAlias}id`]: 'ASC' };

        const sortObj = {};
        sortBy.split(',').forEach((el) => {
            const fieldDirection = el.split('.');
            sortObj[`${entityAlias}${fieldDirection[0]}`] = fieldDirection[1].toUpperCase();
        });

        return sortObj;
    }

    public getRawSortCondition(entityAlias: string, sortBy: string) {
        if (!sortBy) return null;

        const sortQuery = [];
        entityAlias = entityAlias ? `${entityAlias}.` : '';
        sortBy.split(',').forEach((el) => {
            const fieldDirection = el.split('.');
            sortQuery.push(`${entityAlias}${fieldDirection[0]} ${fieldDirection[1]}`);
        });

        return sortQuery.join(', ');
    }

    public getSearchCondition(builder: SelectQueryBuilder<any>, entityAlias: string, search: string) {
        if (!search) return null;

        entityAlias = entityAlias ? `${entityAlias}.` : '';
        const searchFields = search.split(',');
        searchFields.forEach((el) => {
            const field = el.split('.');
            builder.andWhere(`${entityAlias}${field[0]} ILIKE '%${field[1]}%'`);
        });

        return builder;
    }

    public getQueriesSearchCondition(builder: SelectQueryBuilder<any>, entityAlias: string, searchQueries: { [key: string]: any }) {
        entityAlias = entityAlias ? `${entityAlias}.` : '';
        Object.keys(searchQueries).forEach((key) => {
            const value = searchQueries[key];
            if (value) {
                builder.andWhere(`${entityAlias}${key} ILIKE '%${value}%'`);
            }
        });

        return builder;
    }

    public getSearchQueries(queries: { [key: string]: any }) {
        return Object.keys(queries)
            .filter((key) => key.startsWith('search_'))
            .reduce((obj, key) => {
                obj[key.replace('search_', '')] = queries[key];
                return obj;
            }, {});
    }

    public getPagination(queries: { page: number; perPage: number }) {
        const take = Number(queries.perPage) || DEFAULT_PER_PAGE;
        return {
            take: take,
            skip: take * ((Number(queries.page) || DEFAULT_PAGE) - 1),
            pagination: {
                page: Number(queries.page) || DEFAULT_PAGE,
                perPage: Number(queries.perPage) || DEFAULT_PER_PAGE,
            },
        };
    }

    public getQueryBuilderAndPagination(
        repository: Repository<any>,
        queries: { page: number; perPage: number; sortBy: string; [key: string]: any },
    ): { builder: SelectQueryBuilder<any>; take: number; pagination: { page: number; perPage: number } } {
        const { take, skip, pagination } = this.getPagination(queries);
        const builder = repository.createQueryBuilder('entity');
        builder.orderBy({ 'entity.id': 'ASC' });

        if (Number(queries.perPage) !== 0) builder.take(take).skip(skip);
        if (!this.isEmpty(queries.sortBy)) builder.orderBy(this.getSortCondition('entity', queries.sortBy));

        return { builder, take, pagination };
    }

    public isEmpty(value) {
        return (
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)
        );
    }

    public moveFile(oldPath, newPath) {
        try {
            // create directory if not exist
            const dir = path.dirname(newPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.renameSync(oldPath, newPath);
            return true;
        } catch (error) {
            return false;
        }
    }

    public removeFile(filePath) {
        try {
            fs.unlinkSync(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    public checkFileType(file: Express.Multer.File) {
        // Read the file's MIME type
        // const mimeType = mime.getType(filePath);
        const mimeType = file.mimetype;

        // Check if the MIME type belongs to an image, video or document
        if (mimeType.startsWith('image/')) {
            return MEDIA_TYPE.IMAGE;
        } else if (mimeType.startsWith('video/')) {
            return MEDIA_TYPE.VIDEO;
        } else if (
            [
                'application/pdf',
                'application/msword',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ].includes(mimeType)
        ) {
            return MEDIA_TYPE.DOCUMENT;
        } else {
            // File is of some other type
            return MEDIA_TYPE.MISC;
        }
    }

    public getFilePathByType(type: MEDIA_TYPE) {
        switch (type) {
            case MEDIA_TYPE.IMAGE:
                return 'image';
            case MEDIA_TYPE.VIDEO:
                return 'video';
            case MEDIA_TYPE.DOCUMENT:
                return 'document';
            case MEDIA_TYPE.AUDIO:
                return 'audio';
            default:
                return 'misc';
        }
    }

    public async handleUploadedFile(file: Express.Multer.File, userId: string | string[], customPath: string) {
        try {
            if (!file) return false;

            // move file to public folder
            const ymdPath = `${moment().format('YYYYMMDD')}`;
            const oldFilePath = `${file.destination}/${file.filename}`;
            const fileTypePath = this.getFilePathByType(this.checkFileType(file));
            const imagePath = `/public/upload/${fileTypePath}${this.isEmpty(customPath) ? '' : '/' + customPath}${
                this.isEmpty(userId) ? '' : '/' + userId
            }/${ymdPath}/${file.filename}`;

            // move file
            if (!this.moveFile(oldFilePath, `.${imagePath}`)) return false;

            const manager = this.dataSource.manager;
            const media = await manager.save(
                MediaEntity,
                manager.create(MediaEntity, {
                    name: file.originalname,
                    path: imagePath,
                    type: this.checkFileType(file),
                }),
            );

            return media;
        } catch (error) {
            return false;
        }
    }

    public slugify(str) {
        if (!str) return '';
        str = str.toLowerCase();
        //     We can also use this instead of from line 11 to line 17
        //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
        //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
        //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
        //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
        //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
        //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
        //     str = str.replace(/\u0111/g, "d");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        // Some system encode vietnamese combining accent as individual utf-8 characters
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
        // remove special characters except whitespace, -
        str = str.replace(/[^A-Za-z0-9\s\-]/g, '');
        // Remove extra spaces
        str = str.replace(/ /g, '-');
        str = str.replace(/ + /g, '-');
        str = str.replace(/-+-/g, '-'); // Remove extra hyphens
        str = str.replace(/^\-+|\-+$/g, '');
        str = str.trim();

        return str;
    }

    /**
     * @param message to encrypt in JSON format
     * @param ttl (in miliseconds, optional)
     * @returns encrypted message
     */
    public aesEncrypt(message: any, ttl = 900000) {
        const algorithm = 'aes-256-cbc';
        const initVector = process.env.INITVECTOR;
        const Securitykey = process.env.SECRETKEY;
        const cipher = createCipheriv(algorithm, Securitykey, initVector);
        // let encryptedData = cipher.update(`${message}|${process.env.SECRETSTRING}|${Date.now() + ttl}`, 'utf-8', 'hex');
        let encryptedData = cipher.update(
            JSON.stringify({
                message,
                ttl: Date.now() + ttl,
            }),
            'utf-8',
            'hex',
        );
        encryptedData += cipher.final('hex');
        return encryptedData;
    }

    /**
     *
     * @param encrypted message to decrypt
     * @returns decrypted message in JSON format or null if ttl is expired
     */
    public aesDecrypt(encryptedMessage: string) {
        try {
            const algorithm = 'aes-256-cbc';
            const initVector = process.env.INITVECTOR;
            const Securitykey = process.env.SECRETKEY;
            const decipher = createDecipheriv(algorithm, Securitykey, initVector);
            let decryptedData = decipher.update(encryptedMessage, 'hex', 'utf-8');
            decryptedData += decipher.final('utf8');
            const objMessage = JSON.parse(decryptedData);
            console.log('LOG:: objMessage:', objMessage);
            if (objMessage.ttl < Date.now()) {
                return null;
            }
            return objMessage.message;
        } catch (error) {
            console.error('LOG:: aesDecrypt:', error.message);
            return null;
        }
    }
}
