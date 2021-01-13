import {
  IBlockCardService,
  IVolumeFailedTransactionLogsRequest,
  IGetAllBlockedCardsResponse,
  IBlockCardRepository,
  IUpdateBlockedCardRequest,
  IUpdateBlockedCardResponse,
} from './BlockCard.interfaces';

interface IBlockCardServiceDependencies {
  BlockCardRepository: IBlockCardRepository
}

export class BlockCardService implements IBlockCardService {
  private BlockCardRepository: IBlockCardRepository;
  constructor (deps: IBlockCardServiceDependencies) {
    this.BlockCardRepository = deps.BlockCardRepository;
  }
  async searchBlockedCards(data: IVolumeFailedTransactionLogsRequest): Promise<IGetAllBlockedCardsResponse> {
    return await this.BlockCardRepository.searchBlockedCards(data);
  }

  async updateBlockedCard(data: IUpdateBlockedCardRequest): Promise<IUpdateBlockedCardResponse> {
    return await this.BlockCardRepository.updateBlockedCard(data);
  }
}