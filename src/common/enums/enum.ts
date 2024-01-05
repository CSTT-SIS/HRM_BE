export enum USER_STATUS {
    ACTIVE = 'ACTIVE',
    DISABLED = 'DISABLED',
}

export enum USER_ROLE {
    ADMIN = 1,
    USER = 2,
}

export enum SCHEDULE_TYPE {
    CRON = 'cron',
    TIMEOUT = 'timeout',
    INTERVAL = 'interval',
}

export enum MEDIA_TYPE {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    DOCUMENT = 'DOCUMENT',
    MISC = 'MISC',
}

export enum CACHE_TIME {
    ONE_MINUTE = 60,
    THIRTY_MINUTES = 1800,
    ONE_HOUR = 3600,
    ONE_DAY = 86400,
    ONE_WEEK = 604800,
    ONE_MONTH = 2592000,
    ONE_YEAR = 31536000,
}
