
export interface IVolumeFailedTransactionLogsRequest {
  searchQuery: string,
  companyUUID: string,
  orderByField: string,
  orderSort: string,
  page: number,
  limit: number,
}

export interface BlockedCardDataResponseModel {
  id: number,
  email: string,
  card: string,
  attemtps: number,
  latest_transaction_status: string,
  status: number,
  is_read: boolean,
  created_at: Date,
}

export interface IGetAllBlockedCardsResponse {
  data: BlockedCardDataResponseModel[],
  pages: number,
  limit: number,
  current_page: number,
  total: number,
}

export interface IUpdateBlockedCardRequest {
  id: number,
  enrolled_status: "Y" | "N" | "B" | null,
  is_read: number | null,
}

export interface IUpdateBlockedCardResponse {
  data: BlockedCardDataResponseModel;
}

export interface IBlockCardRepository {
  searchBlockedCards(data: IVolumeFailedTransactionLogsRequest): Promise<IGetAllBlockedCardsResponse>
  updateBlockedCard(data: IUpdateBlockedCardRequest): Promise<IUpdateBlockedCardResponse>
}

export interface IBlockCardService {
  searchBlockedCards(data: IVolumeFailedTransactionLogsRequest): Promise<IGetAllBlockedCardsResponse>
  updateBlockedCard(data: IUpdateBlockedCardRequest): Promise<IUpdateBlockedCardResponse>
}