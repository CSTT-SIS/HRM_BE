import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';
export const Permission = (...args: string[]) => {
    console.log(PERMISSION_KEY);
    return SetMetadata(PERMISSION_KEY, args);
};
