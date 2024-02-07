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

export enum INVENTORY_HISTORY_TYPE {
    IMPORT = 'IMPORT',
    EXPORT = 'EXPORT',
    ADJUSTMENT = 'ADJUSTMENT',
    TRANSFER = 'TRANSFER',
    STOCKING = 'STOCKING',
    REPLENISHMENT = 'REPLENISHMENT',
}

export enum PROPOSAL_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum PROPOSAL_TYPE {
    PURCHASE = 'PURCHASE',
    REPAIR = 'REPAIR',
    SUPPLY = 'SUPPLY',
    // ADJUSTMENT = 'ADJUSTMENT',
    // TRANSFER = 'TRANSFER',
    // STOCKING = 'STOCKING',
    // REPLENISHMENT = 'REPLENISHMENT',
}

export enum PROPOSAL_TYPE_NAME {
    PURCHASE = 'Yêu cầu mua hàng',
    REPAIR = 'Yêu cầu sửa chữa',
    SUPPLY = 'Yêu cầu cấp vật tư',
}

export enum WAREHOUSING_BILL_TYPE {
    IMPORT = 'IMPORT',
    EXPORT = 'EXPORT',
    // ADJUSTMENT = 'ADJUSTMENT',
    // TRANSFER = 'TRANSFER',
    // STOCKING = 'STOCKING',
    // REPLENISHMENT = 'REPLENISHMENT',
}

export enum WAREHOUSING_BILL_TYPE_NAME {
    IMPORT = 'Phiếu nhập kho',
    EXPORT = 'Phiếu xuất kho',
}

export enum WAREHOUSING_BILL_STATUS {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum STOCKTAKE_STATUS {
    DRAFT = 'DRAFT',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum ORDER_TYPE {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
}

export enum ORDER_TYPE_NAME {
    PURCHASE = 'Đơn hàng mua',
    SALE = 'Đơn hàng bán',
}

export enum ORDER_STATUS {
    PENDING = 'PENDING',
    ORDERED = 'ORDERED',
    SHIPPING = 'SHIPPING',
    RECEIVED = 'RECEIVED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
}

export enum DAMAGE_LEVEL {
    MINOR = 'MINOR',
    MODERATE = 'MODERATE',
    SEVERE = 'SEVERE',
}

export enum REPAIR_REQUEST_STATUS {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum STAFF_STATUS {
    ACTIVE = 1,
    INACTIVE = 0,
}

export enum CALENDAR_TYPE {
    GENERAL = 1,
    // ----
}

export enum CONTRACT_STATUS {
    ACTIVE = 1,
    INACTIVE = 0,
}

export enum CONTRACT_TYPE {
    GENERAL = 1,
    // ----
}

export enum CONTRACT_RESULT {
    GENERAL = 1,
    // ----
}

export enum LEAVE_STATUS {
    PENDING = 1,
    // ----
}

export enum SHIFT_TYPE {
    MORNING = 1,
    // ----
}

export enum RESIGNATION_STATUS {
    PENDING = 1,
    // ----
}

export enum EMPLOYEE_LEAVE_REQUEST_STATUS {
    ACCEPT = 1,
    // ----
}

export enum FORGOTTEN_TIMEKEEPING_REQUEST_STATUS {
    ACCEPT = 1,
    // ----
}

export enum OVERTIME_REQUEST_STATUS {
    ACCEPT = 1,
    // ----
}

export enum TIME_ATTENDANCE_STATUS {
    ACCEPT = 1,
    // ----
}

export enum TASK_PRIORITY {
    HIGH = 1,
    // ----
}

export enum ASSET_STATUS {
    ACTIVE = 1,
    // ----
}
