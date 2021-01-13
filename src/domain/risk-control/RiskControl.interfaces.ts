import { RiskControlGlobalConfig } from './../../data/database';

export { RiskControlGlobalConfig };

export interface IRiskControlRepository {
  getRiskControlConfig(): Promise<RiskControlGlobalConfig | null>;
  toggleRiskControl({ enabled }: { enabled: boolean }): Promise<RiskControlGlobalConfig | undefined>;
}

// tslint:disable-next-line: interface-over-type-literal
export type RiskControlServiceDeps = {
  RiskControlRepository: IRiskControlRepository
}

export interface IRiskControlResponse {
  enabled: boolean
}

export interface IRiskControlService {
  getRiskControlConfig(): Promise<IRiskControlResponse | null>;
  toggleRiskControl({ enabled }: { enabled: boolean }): Promise<IRiskControlResponse | null>;
}
