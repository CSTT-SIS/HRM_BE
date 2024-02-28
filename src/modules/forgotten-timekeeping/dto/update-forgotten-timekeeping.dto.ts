import { PartialType } from '@nestjs/swagger';
import { CreateForgottenTimekeepingDto } from './create-forgotten-timekeeping.dto';

export class UpdateForgottenTimekeepingDto extends PartialType(CreateForgottenTimekeepingDto) {}
