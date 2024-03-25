import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { USER_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from '~/database/typeorm/entities/abstract.entity';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { InventoryHistoryEntity } from '~/database/typeorm/entities/inventoryHistory.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { CalendarUserEntity } from './calendarUser.entity';
import { ContractEntity } from './contract.entity';
import { DisciplineEntity } from './discipline.entity';
import { EmployeeLeaveRequestEntity } from './employeeLeaveRequest.entity';
import { ForgottenTimekeepingRequestEntity } from './forgottenTimekeepingRequest.entity';
import { FreeTimekeepingEntity } from './freeTimekeeping.entity';
import { LeaveApplicationEntity } from './leaveApplication.entity';
import { OvertimeRequestEntity } from './overtimeRequest.entity';
import { ResignationFormEntity } from './resignationForm.entity';
import { RewardEntity } from './reward.entity';
import { TaskEntity } from './task.entity';
import { TimeAttendanceEntity } from './timeAttendance.entity';
import { UserShiftEntity } from './userShift.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'avatar', type: 'varchar', length: 1000, nullable: true })
    avatar: string;

    @Column({ name: 'code', type: 'varchar', length: 255, nullable: true })
    code: string;

    @Index('IDX_FULL_NAME', { fulltext: true })
    @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
    fullName: string;

    @Index('IDX_USER_EMAIL', { fulltext: true })
    @Column({ name: 'email', type: 'varchar', length: 255, nullable: true, unique: true })
    email: string;

    @Column({ name: 'phone_number', type: 'varchar', length: 15, nullable: true })
    phoneNumber: string;

    @Column({ name: 'another_name', type: 'varchar', length: 255, nullable: true })
    anotherName: string;

    @Column({ name: 'birthday', type: 'date', nullable: true })
    birthDay: Date;

    //1: Nam, 2: Nữ
    @Column({ name: 'sex', type: 'int', nullable: true })
    sex: number;

    @Column({ name: 'identity_number', type: 'nvarchar', length: 255, nullable: true })
    identityNumber: string;

    @Column({ name: 'identity_date', type: 'date', nullable: true })
    identityDate: Date;

    @Column({ name: 'identity_place', type: 'varchar', length: 255, nullable: true })
    identityPlace: string;

    @Column({ name: 'passport_number', type: 'varchar', length: 255, nullable: true })
    passportNumber: string;

    @Column({ name: 'passport_date', type: 'date', nullable: true })
    passportDate: Date;

    @Column({ name: 'passport_place', type: 'varchar', length: 255, nullable: true })
    passportPlace: string;

    @Column({ name: 'passport_expired', type: 'date', nullable: true })
    passportExpired: Date;

    @Column({ name: 'place_of_birth', type: 'varchar', length: 255, nullable: true })
    placeOfBirth: string;

    @Column({ name: 'nation', type: 'varchar', length: 255, nullable: true })
    nation: string;

    @Column({ name: 'province', type: 'varchar', length: 255, nullable: true })
    province: string;

    @Column({ name: 'religion', type: 'varchar', length: 255, nullable: true })
    religion: string;

    @Column({ name: 'marital_status', type: 'varchar', length: 255, nullable: true })
    maritalStatus: string;

    @Column({ type: 'enum', enum: USER_STATUS, default: USER_STATUS.ACTIVE })
    status: USER_STATUS;

    @Column({ name: 'date_of_join', type: 'date', nullable: true })
    dateOfJoin: Date;

    @Column({ name: 'tax_code', type: 'varchar', length: 255, nullable: true })
    taxCode: string;

    @Column({ name: 'bank_account', type: 'varchar', length: 255, nullable: true })
    bankAccount: string;

    @Column({ name: 'bank_name', type: 'varchar', length: 255, nullable: true })
    bankName: string;

    @Column({ name: 'bank_branch', type: 'varchar', length: 255, nullable: true })
    bankBranch: string;

    @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
    createdBy: number;

    @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
    updatedBy: number;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    @Column({ name: 'account_id', type: 'int', unsigned: true, nullable: true })
    accountId: number;

    @Column({ name: 'role_id', type: 'int', unsigned: true, nullable: true })
    roleId: number;

    @Column({ name: 'position_id', type: 'int', unsigned: true, nullable: true })
    positionId: number;

    @Column({ name: 'indirect_superior', type: 'int', unsigned: true, nullable: true })
    indirectSuperior: number;

    @Column({ name: 'direct_superior', type: 'int', unsigned: true, nullable: true })
    directSuperior: number;

    /* RELATION */
    @OneToOne(() => AccountEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
    account: Relation<AccountEntity>;

    @ManyToOne(() => RoleEntity, (role: RoleEntity) => role.id, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role: Relation<RoleEntity>;

    @ManyToOne(() => DepartmentEntity, (entity: DepartmentEntity) => entity.users, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;

    @OneToMany(() => InventoryEntity, (entity: InventoryEntity) => entity.createdBy, { createForeignKeyConstraints: false })
    inventories: Relation<InventoryEntity>[];

    @OneToMany(() => InventoryHistoryEntity, (entity: InventoryHistoryEntity) => entity.updatedBy, { createForeignKeyConstraints: false })
    invetoryHistories: Relation<InventoryHistoryEntity>[];

    @OneToMany(() => ProposalEntity, (entity: ProposalEntity) => entity.createdBy, { createForeignKeyConstraints: false })
    proposals: Relation<ProposalEntity>[];

    @OneToMany(() => WarehousingBillEntity, (entity: WarehousingBillEntity) => entity.createdBy, { createForeignKeyConstraints: false })
    warehousingBills: Relation<WarehousingBillEntity>[];

    @OneToMany(() => ContractEntity, (entity: ContractEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    contracts: Relation<ContractEntity>[];

    @OneToMany(() => LeaveApplicationEntity, (entity: LeaveApplicationEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    leaveApplications: Relation<LeaveApplicationEntity>[];

    @OneToMany(() => LeaveApplicationEntity, (entity: LeaveApplicationEntity) => entity.approvedByUser, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedLeaveApplications: Relation<LeaveApplicationEntity>[];

    @OneToMany(() => UserShiftEntity, (entity: UserShiftEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    userShifts: Relation<UserShiftEntity>[];

    @OneToMany(() => DisciplineEntity, (entity: DisciplineEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    disciplines: Relation<DisciplineEntity>[];

    @OneToMany(() => ResignationFormEntity, (entity: ResignationFormEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    resignationForms: Relation<ResignationFormEntity>[];

    @OneToMany(() => ResignationFormEntity, (entity: ResignationFormEntity) => entity.approvedByUser, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedResignationForms: Relation<ResignationFormEntity>[];

    @OneToMany(() => EmployeeLeaveRequestEntity, (entity: EmployeeLeaveRequestEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    employeeLeaveRequests: Relation<EmployeeLeaveRequestEntity>[];

    @OneToMany(() => EmployeeLeaveRequestEntity, (entity: EmployeeLeaveRequestEntity) => entity.approver, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedEmployeeLeaveRequests: Relation<EmployeeLeaveRequestEntity>[];

    @OneToMany(() => ForgottenTimekeepingRequestEntity, (entity: ForgottenTimekeepingRequestEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    forgottenTimekeepingRequests: Relation<ForgottenTimekeepingRequestEntity>[];

    @OneToMany(() => ForgottenTimekeepingRequestEntity, (entity: ForgottenTimekeepingRequestEntity) => entity.approver, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedForgottenTimekeepingRequests: Relation<ForgottenTimekeepingRequestEntity>[];

    @OneToMany(() => OvertimeRequestEntity, (entity: OvertimeRequestEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    overtimeRequests: Relation<OvertimeRequestEntity>[];

    @OneToMany(() => OvertimeRequestEntity, (entity: OvertimeRequestEntity) => entity.approver, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedOvertimeRequests: Relation<OvertimeRequestEntity>[];

    @OneToMany(() => TimeAttendanceEntity, (entity: TimeAttendanceEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    timeAttendances: Relation<TimeAttendanceEntity>[];

    @OneToMany(() => TaskEntity, (entity: TaskEntity) => entity.creator, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    createdTasks: Relation<TaskEntity>[];

    @OneToMany(() => TaskEntity, (entity: TaskEntity) => entity.coordinator, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    coordinatedTasks: Relation<TaskEntity>[];

    @OneToMany(() => TaskEntity, (entity: TaskEntity) => entity.assignee, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    assignedTasks: Relation<TaskEntity>[];

    @OneToMany(() => RewardEntity, (entity: RewardEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    rewards: Relation<RewardEntity>[];

    @OneToMany(() => FreeTimekeepingEntity, (entity: FreeTimekeepingEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    freeTimekeepings: Relation<FreeTimekeepingEntity>[];

    @OneToMany(() => CalendarUserEntity, (entity: CalendarUserEntity) => entity.user, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    calendarUsers: Relation<CalendarUserEntity>[];
}
