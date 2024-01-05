import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export function bootstrapHelmet(app: INestApplication): void {
    app.use(helmet());
}
