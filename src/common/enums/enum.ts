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
    STOCKTAKE = 'STOCKTAKE',
}

export enum PROPOSAL_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    HEAD_APPROVED = 'HEAD_APPROVED', // only for purchase proposal
    HEAD_REJECTED = 'HEAD_REJECTED', // only for purchase proposal
    MANAGER_APPROVED = 'MANAGER_APPROVED', // only for purchase proposal
    MANAGER_REJECTED = 'MANAGER_REJECTED', // only for purchase proposal
    // APPROVED = 'APPROVED',
    // REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum PROPOSAL_TYPE {
    PURCHASE = 'PURCHASE',
    SUPPLY = 'SUPPLY',
    // REPAIR = 'REPAIR',
    // ADJUSTMENT = 'ADJUSTMENT',
    // TRANSFER = 'TRANSFER',
    // STOCKING = 'STOCKING',
    // REPLENISHMENT = 'REPLENISHMENT',
}

export enum PROPOSAL_TYPE_NAME {
    PURCHASE = 'Yêu cầu mua hàng',
    SUPPLY = 'Yêu cầu cấp vật tư',
    // REPAIR = 'Yêu cầu sửa chữa',
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
    // APPROVED = 'APPROVED',
    // REJECTED = 'REJECTED',
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
    // SALE = 'SALE',
}

export enum ORDER_TYPE_NAME {
    PURCHASE = 'Đơn nhập hàng',
    // SALE = 'Đơn bán hàng',
}

export enum ORDER_STATUS {
    PENDING = 'PENDING',
    PLACED = 'PLACED',
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

export enum DAMAGE_LEVEL_NAME {
    MINOR = 'Nhẹ',
    MODERATE = 'Trung bình',
    SEVERE = 'Nặng',
}

export enum REPAIR_REQUEST_STATUS {
    IN_PROGRESS = 'IN_PROGRESS',
    GARAGE_RECEIVED = 'GARAGE_RECEIVED',
    HEAD_APPROVED = 'HEAD_APPROVED',
    HEAD_REJECTED = 'HEAD_REJECTED',
    EXPORTED = 'EXPORTED',
}

export enum HUMAN_DASHBOARD_TYPE {
    SEX = 'SEX',
    SENIORITY = 'SENIORITY',
    BY_MONTH = 'BY_MONTH',
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
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    CLOSED = 'CLOSED',
    // ----
}

export enum OVERTIME_REQUEST_STATUS {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    CLOSED = 'CLOSED',
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

export enum LETTER_TYPE {
    LATE = 'LATE',
    SOON = 'SOON',
    // ----
}
