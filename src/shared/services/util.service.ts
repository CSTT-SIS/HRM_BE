import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv } from 'crypto';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '~/common/constants/constant';
import { MEDIA_TYPE } from '~/common/enums/enum';
import { DatabaseService } from '~/database/typeorm/database.service';

@Injectable()
export class UtilService {
    constructor(private readonly database: DatabaseService) {}

    capitalizeFirstLetter(str: string) {
        if (!str) return null;
        str = str.toLowerCase();
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    generateString(length = 16) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    getSortCondition(
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

    getRawSortCondition(entityAlias: string, sortBy: string) {
        if (!sortBy) return null;

        const sortQuery = [];
        entityAlias = entityAlias ? `${entityAlias}.` : '';
        sortBy.split(',').forEach((el) => {
            const fieldDirection = el.split('.');
            sortQuery.push(`${entityAlias}${fieldDirection[0]} ${fieldDirection[1]}`);
        });

        return sortQuery.join(', ');
    }

    getPagination(queries: { page: number; perPage: number }) {
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

    /**
     * Get query builder, take, skip and pagination
     * @param repository - Repository
     * @param queries - { page: number; perPage: number; sortBy: string; [key: string]: any }
     */
    getQueryBuilderAndPagination(
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

    isEmpty(value) {
        return (
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)
        );
    }

    moveFile(oldPath, newPath) {
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

    removeFile(filePath) {
        try {
            fs.unlinkSync(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    checkFileType(file: Express.Multer.File) {
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

    getFilePathByType(type: MEDIA_TYPE) {
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

    async handleUploadedFile(file: Express.Multer.File, userId: string | string[], customPath: string) {
        try {
            if (!file) return false;

            // move file to folder
            const ymdPath = `${moment().format('YYYYMMDD')}`;
            const oldFilePath = `${file.destination}/${file.filename}`;
            const fileTypePath = this.getFilePathByType(this.checkFileType(file));
            const imagePath = `/public/upload/${fileTypePath}${this.isEmpty(customPath) ? '' : '/' + customPath}${
                this.isEmpty(userId) ? '' : '/' + userId
            }/${ymdPath}/${file.filename}`;

            // move file
            if (!this.moveFile(oldFilePath, `.${imagePath}`)) return false;

            const media = await this.database.media.save(
                this.database.media.create({
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

    /**
     * Slugify Vietnamese string from 'Nguyễn Văn A@' to 'nguyen-van-a'
     * @param str - Vietnamese string
     * @returns slugified string
     */
    slugify(str) {
        if (!str) return '';
        str = str.toLowerCase();
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
     * Encrypt message with AES-256-CBC
     * @param message to encrypt in JSON format
     * @param ttl (in miliseconds, optional)
     * @returns encrypted message
     */
    aesEncrypt(message: object, ttl = 900000): string {
        const algorithm = 'aes-256-cbc';
        const initVector = process.env.INITVECTOR;
        const Securitykey = process.env.SECRETKEY;
        const cipher = createCipheriv(algorithm, Securitykey, initVector);
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
     * Decrypt AES-256-CBC encrypted message
     * @param encrypted message to decrypt
     * @returns decrypted message in JSON format or null if ttl is expired
     */
    aesDecrypt(encryptedMessage: string) {
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

    /**
     * **YOU MUST INDEX THE FIELDS BEFORE USING THIS FUNCTION**\
     * Full text search with raw query
     * @param data.entityAlias alias of entity, default is 'entity'
     * @param data.fields fields to search
     * @param data.keyword keyword to search
     * @returns raw fulltext condition string with OR operator between fields
     */
    fullTextSearch(data: { entityAlias?: string; fields?: string[]; keyword: string }) {
        if (this.isEmpty(data.keyword)) return {};
        const { entityAlias, keyword, fields } = data;
        const entityAliasString = entityAlias ? `${entityAlias}.` : 'entity.';
        return fields
            .map((field) => `MATCH (${field.indexOf('.') === -1 ? entityAliasString : ''}${field}) AGAINST ('${keyword}*' IN BOOLEAN MODE)`)
            .join(' OR ');
    }

    /**
     * Search with raw query using LIKE statement
     * @param data.entityAlias alias of entity, default is 'entity'
     * @param data.fields fields to search
     * @param data.keyword keyword to search
     * @returns raw condition string with OR operator between fields
     */
    rawQuerySearch(data: { entityAlias?: string; fields?: string[]; keyword: string }) {
        if (this.isEmpty(data.keyword)) return {};
        const { entityAlias, keyword, fields } = data;
        const entityAliasString = entityAlias ? `${entityAlias}.` : 'entity.';
        return fields.map((field) => `${field.indexOf('.') === -1 ? entityAliasString : ''}${field} LIKE '%${keyword}%'`).join(' OR ');
    }

    /**
     * Search with raw query using = statement
     * @param data.entityAlias alias of entity, default is 'entity'
     * @param data.any properties & keywords to search
     * @returns raw condition string with AND operator between fields
     */
    relationQuerySearch(data: { entityAlias?: string; [key: string]: any }) {
        const { entityAlias, ...rest } = data;
        const entityAliasString = entityAlias ? `${entityAlias}.` : 'entity.';
        const fields = Object.keys(rest);
        return (
            fields
                .map((field) => {
                    if (this.isEmpty(rest[field])) return null;
                    const searchCondition = rest[field] == 0 ? 'IS NULL' : `= '${rest[field]}'`;
                    return `${field.indexOf('.') === -1 ? entityAliasString : ''}${field} ${searchCondition}`;
                })
                .filter((el) => el !== null)
                .join(' AND ') || '1=1'
        );
    }

    /**
     * Check if relation id exist in database
     * @param data.key name of repository in database service
     * @param data.value id of relation or object with id, other fields are optional (ex: { id: 1, name?: 'abc', errorMessage?: 'error message' })
     * @returns true if exist, throw error if not
     */
    async checkRelationIdExist(data: { [key: string]: { [key: string]: any; errorMessage?: string } | number }) {
        const fields = Object.keys(data);
        for (const field of fields) {
            if (this.isEmpty(data[field])) continue;
            let where = {};
            let errorMessage = `Không tìm thấy ${field} (id: ${data[field]['id']})`;
            if (typeof data[field] === 'object') {
                if (this.isEmpty(data[field]['id'])) continue;
                errorMessage = data[field]['errorMessage'] || errorMessage;
                delete data[field]['errorMessage'];
                where = data[field];
            } else {
                where = { id: data[field] };
            }

            const count = await this.database[field].countBy(where);
            if (!count) throw new BadRequestException(errorMessage);
        }

        return true;
    }

    /**
     * Get conditions object from queries for query builder
     * @param queries - Queries from request
     * @param keys - Keys in queries to get conditions
     * @returns conditions object
     */
    getConditionsFromQuery(queries: { [key: string]: any }, keys: string[] = []) {
        const result = {};
        for (const key of keys) {
            if (!this.isEmpty(queries[key])) result[key] = queries[key];
        }
        return result;
    }

    async checkApprovalPermission(data: { entity: string; approverId: number; toStatus: string }) {
        const config = await this.database.approvalConfig.getConfig(data);
        if (!config) throw new HttpException('Bạn không có quyền duyệt phiếu sửa chữa', 403);
    }
}
