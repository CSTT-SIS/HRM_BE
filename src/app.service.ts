import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { TokenService } from '~/shared/services';

@Injectable()
export class AppService {
    constructor(private readonly tokenService: TokenService, private readonly database: DatabaseService) {}

    async test(str) {}
}
