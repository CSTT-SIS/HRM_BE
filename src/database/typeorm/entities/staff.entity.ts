import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { STAFF_STATUS } from '~/common/enums/enum';
import { DepartmentEntity } from './department.entity';
import { ContractEntity } from './contract.entity';
import { LeaveApplicationEntity } from './leaveApplication.entity';
import { DisciplineEntity } from './discipline.entity';
import { StaffShiftEntity } from './staffShift.entity';
import { ResignationFormEntity } from './resignationForm.entity';
import { EmployeeLeaveRequestEntity } from './employeeLeaveRequest.entity';
import { ForgottenTimekeepingRequestEntity } from './forgottenTimekeepingRequest.entity';
import { OvertimeRequestEntity } from './overtimeRequest.entity';
import { TimeAttendanceEntity } from './timeAttendance.entity';
import { TaskEntity } from './task.entity';
import { RewardEntity } from './reward.entity';
import { CalendarEntity } from './calendar.entity';

@Entity({ name: 'staffs' })
export class StaffEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'code', type: 'varchar', length: 255, nullable: true })
    code: string;

    @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
    fullName: string;

    @Column({ name: 'avatar', type: 'varchar', length: 255, nullable: true })
    avatar: string;

    @Column({ name: 'birth_day', type: 'date', nullable: true })
    birthDay: Date;

    @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'email', type: 'varchar', length: 255, nullable: true, unique: true })
    email: string;

    //1: Nam, 2: Nữ
    @Column({ name: 'sex', type: 'int', nullable: true })
    sex: number;

    @Column({ name: 'identity', type: 'nvarchar', length: 255, nullable: true })
    identity: string;

    @Column({ name: 'phone_number', type: 'varchar', length: 255, nullable: true })
    phoneNumber: string;

    @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
    password: string;

    @Column({ name: 'degree', type: 'varchar', length: 255, nullable: true })
    degree: string;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    @Column({ type: 'enum', enum: STAFF_STATUS, default: STAFF_STATUS.ACTIVE })
    status: STAFF_STATUS;

    @Column({ name: 'passport_expired', type: 'date', nullable: true })
    passportExpired: Date;

    /* RELATION */
    @ManyToOne(() => DepartmentEntity, (entity: DepartmentEntity) => entity.staffs, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;

    @OneToMany(() => ContractEntity, (entity: ContractEntity) => entity.staff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    contracts: Relation<ContractEntity>[];

    @OneToMany(() => LeaveApplicationEntity, (entity: LeaveApplicationEntity) => entity.staff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    leaveApplications: Relation<LeaveApplicationEntity>[];

    @OneToMany(() => LeaveApplicationEntity, (entity: LeaveApplicationEntity) => entity.approvedByStaff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedLeaveApplications: Relation<LeaveApplicationEntity>[];

    @OneToMany(() => StaffShiftEntity, (entity: StaffShiftEntity) => entity.staff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    staffShifts: Relation<StaffShiftEntity>[];

    @OneToMany(() => DisciplineEntity, (entity: DisciplineEntity) => entity.staff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    disciplines: Relation<DisciplineEntity>[];

    @OneToMany(() => ResignationFormEntity, (entity: ResignationFormEntity) => entity.staff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    resignationForms: Relation<ResignationFormEntity>[];

    @OneToMany(() => ResignationFormEntity, (entity: ResignationFormEntity) => entity.approvedByStaff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedResignationForms: Relation<ResignationFormEntity>[];

    @OneToMany(() => EmployeeLeaveRequestEntity, (entity: EmployeeLeaveRequestEntity) => entity.staff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    employeeLeaveRequests: Relation<EmployeeLeaveRequestEntity>[];

    @OneToMany(() => EmployeeLeaveRequestEntity, (entity: EmployeeLeaveRequestEntity) => entity.approver, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedEmployeeLeaveRequests: Relation<EmployeeLeaveRequestEntity>[];

    @OneToMany(() => ForgottenTimekeepingRequestEntity, (entity: ForgottenTimekeepingRequestEntity) => entity.staff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    forgottenTimekeepingRequests: Relation<ForgottenTimekeepingRequestEntity>[];

    @OneToMany(() => ForgottenTimekeepingRequestEntity, (entity: ForgottenTimekeepingRequestEntity) => entity.approver, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedForgottenTimekeepingRequests: Relation<ForgottenTimekeepingRequestEntity>[];

    @OneToMany(() => OvertimeRequestEntity, (entity: OvertimeRequestEntity) => entity.staff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    overtimeRequests: Relation<OvertimeRequestEntity>[];

    @OneToMany(() => OvertimeRequestEntity, (entity: OvertimeRequestEntity) => entity.approver, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    approvedOvertimeRequests: Relation<OvertimeRequestEntity>[];

    @OneToMany(() => TimeAttendanceEntity, (entity: TimeAttendanceEntity) => entity.staff, {
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

    @OneToMany(() => RewardEntity, (entity: RewardEntity) => entity.staff, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    rewards: Relation<RewardEntity>[];

    @OneToMany(() => CalendarEntity, (entity: CalendarEntity) => entity.department, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    calendars: Relation<CalendarEntity>[];
}
