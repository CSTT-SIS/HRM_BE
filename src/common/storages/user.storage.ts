import { AsyncLocalStorage } from 'async_hooks';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

export const UserStorage = {
    storage: new AsyncLocalStorage<UserEntity>(),
    get() {
        return this.storage.getStore();
    },
    set(user: UserEntity) {
        return this.storage.enterWith(user);
    },
};
