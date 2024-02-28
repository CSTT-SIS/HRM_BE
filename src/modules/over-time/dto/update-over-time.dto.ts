import { PartialType } from '@nestjs/swagger';
import { CreateOverTimeDto } from './create-over-time.dto';

export class UpdateOverTimeDto extends PartialType(CreateOverTimeDto) {}
