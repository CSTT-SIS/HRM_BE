import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import database from '~/config/database.config';
import mail from '~/config/mail.config';
import redis from '~/config/redis.config';
import token from '~/config/token.config';
import { DatabaseModule } from '~/database/typeorm';
import { CreateProposalDto } from '~/modules/proposal/dto/create-proposal.dto';
import { ProposalService } from '~/modules/proposal/proposal.service';
import { SharedModule } from '~/shared/shared.module';

describe('ProposalService', () => {
    let service: ProposalService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                DatabaseModule,
                SharedModule,
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['.env'],
                    load: [token, database, mail, redis],
                    cache: true,
                }),
            ],
            providers: [ProposalService],
        }).compile();

        service = module.get<ProposalService>(ProposalService);
    });

    describe('create', () => {
        it('should create a new proposal', () => {
            const createProposalDto: CreateProposalDto = {
                typeId: 1,
                warehouseId: 1,
                name: 'Test',
                content: 'Test',
                details: [
                    {
                        productId: 1,
                        quantity: 1,
                        note: 'Test',
                    },
                ],
            };

            const result = service.create(createProposalDto);

            expect(result).toBeDefined();
            // Add more assertions to validate the result
        });
    });
});
