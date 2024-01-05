import { Injectable } from '@nestjs/common';
import { TokenService } from '~/shared/services';

@Injectable()
export class AppService {
    constructor(private readonly tokenService: TokenService) {}

    test(str) {
        // const { salt, hash } = this.tokenService.hashPassword(str);
        // const isMatch = this.tokenService.isPasswordCorrect(str, hash);
        // return {
        //     str,
        //     salt,
        //     hash,
        //     isMatch,
        // };
    }
}
