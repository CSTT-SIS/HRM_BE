import { INestApplication, ValidationPipe } from '@nestjs/common';

export function bootstrapValidation(app: INestApplication): void {
    // https://github.com/typestack/class-validator#using-service-container
    // useContainer(app.select(AppModule), { fallbackOnErrors: true })

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            //   transform: true,
            // transformOptions: {
            //   // strategy: 'exposeAll',
            //   excludeExtraneousValues: true,
            // },
            // stopAtFirstError: false,
            // forbidUnknownValues: true,
            // disableErrorMessages: false,
            // exceptionFactory: (errors) => new BadRequestException(errors),
            // validationError: { target: true, value: true },
        }),
    );
}
