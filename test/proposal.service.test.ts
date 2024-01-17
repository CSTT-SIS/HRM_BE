import { Test, TestingModule } from '@nestjs/testing';
import { CreateProposalDto } from '~/modules/proposal/dto/create-proposal.dto';
import { ProposalService } from '~/modules/proposal/proposal.service';

describe('ProposalService', () => {
    let service: ProposalService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProposalService],
        }).compile();

        service = module.get<ProposalService>(ProposalService);
    });

    describe('create', () => {
        it('should create a new proposal', () => {
            const createProposalDto: CreateProposalDto = {
                typeId: 1,
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
