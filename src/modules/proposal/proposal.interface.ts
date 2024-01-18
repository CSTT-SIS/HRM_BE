import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';

export declare class IProposalService {
    /**
     * Check if user can update or delete proposal \
     * User must be the creator of the proposal and the status must be the same as the one in the statuses array
     * @param id proposal id
     * @param statuses array of valid statuses
     * @param userId (optional) creator id
     * @returns proposal entity
     */
    isProposalValid(id: number, statuses: any[], userId?: number): Promise<ProposalEntity>;
}
