
export interface IVolumeFailedTransactionLogsDataDomain {
  id: number,
  customer: string,
  transaction_volume: number,
  rc1: number,
  rc2: number,
  rc3: number,
  rc4: number,
  status: string,
  latest_alert_sent: string,
  updated_at: Date,
}

export interface IVolumeFailedTransactionLogsResponse {
  pages: number, limit: number, current_page: number, total: number, data: IVolumeFailedTransactionLogsDataDomain[]
}

export interface IVolumeFailedTransactionLogsRequest {
  searchQuery: string, orderByField: string, orderSort: string, page: number, limit: number
}