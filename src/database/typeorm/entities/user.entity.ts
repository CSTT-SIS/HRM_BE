import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { USER_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from '~/database/typeorm/entities/abstract.entity';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { InventoryHistoryEntity } from '~/database/typeorm/entities/inventoryHistory.entity';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { ContractEntity } from './contract.entity';
import { LeaveApplicationEntity } from './leaveApplication.entity';
import { DisciplineEntity } from './discipline.entity';
import { ResignationFormEntity } from './resignationForm.entity';
import { EmployeeLeaveRequestEntity } from './employeeLeaveRequest.entity';
import { ForgottenTimekeepingRequestEntity } from './forgottenTimekeepingRequest.entity';
import { OvertimeRequestEntity } from './overtimeRequest.entity';
import { TimeAttendanceEntity } from './timeAttendance.entity';
import { TaskEntity } from './task.entity';
import { RewardEntity } from './reward.entity';
import { UserShiftEntity } from './userShift.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'account_id', type: 'int', unsigned: true })
    accountId: number;

    @Column({ name: 'role_id', type: 'int', unsigned: true, nullable: true })
    roleId: number;

    @Column({ name: 'media_id', type: 'int', unsigned: true, nullable: true })
    avatarId: number;

    @Index('IDX_FULL_NAME', { fulltext: true })
    @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
    fullName: string;

    @Index('IDX_USER_EMAIL', { fulltext: true })
    @Column({ name: 'email', type: 'varchar', length: 255, nullable: true, unique: true })
    email: string;

    @Column({ name: 'area_code', type: 'varchar', length: 5, nullable: true })
    areaCode: string;

    @Column({ name: 'phone', type: 'varchar', length: 15, nullable: true })
    phone: string;

    @Column({ name: 'birthday', type: 'varchar', length: 255, nullable: true })
    birthday: string;

    @Column({ name: 'address', type: 'varchar', length: 500, nullable: true })
    address: string;

    @Column({ name: 'gender', type: 'varchar', length: 10, nullable: true })
    gender: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ type: 'enum', enum: USER_STATUS, default: USER_STATUS.ACTIVE })
    status: USER_STATUS;

    @Column({ name: 'identity', type: 'nvarchar', length: 255, nullable: true })
    identity: string;

    @Column({ name: 'degree', type: 'varchar', length: 255, nullable: true })
    degree: string;

    @Column({ name: 'passport_expired', type: 'date', nullable: true })
    passportExpired: Date;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

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

    @ManyToOne(() => MediaEntity, (entity: MediaEntity) => entity.users, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'media_id', referencedColumnName: 'id' })
    avatar: Relation<MediaEntity>;

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
}
