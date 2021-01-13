import { IRiskControlRepository, RiskControlServiceDeps, IRiskControlService , IRiskControlResponse } from './RiskControl.interfaces';

export class RiskControlService implements IRiskControlService {
  private riskControlRepository: IRiskControlRepository;
  
  constructor (riskControlServiceDeps: RiskControlServiceDeps) {
    this.riskControlRepository = riskControlServiceDeps.RiskControlRepository;
  }

  async getRiskControlConfig(): Promise<IRiskControlResponse | null> {
    const toggleRiskControlRes = await this.riskControlRepository.getRiskControlConfig();
    if (!toggleRiskControlRes) {
      return null;
    }
    return {
      enabled: toggleRiskControlRes.enabled
    };
  }

  async toggleRiskControl({ enabled }: { enabled: boolean; }): Promise<IRiskControlResponse | null> {
    const toggleRiskControlRes = await this.riskControlRepository.toggleRiskControl({ enabled });
    console.log(toggleRiskControlRes, 'toggleRiskControlRestoggleRiskControlRes');
    if (!toggleRiskControlRes) {
      return null;
    }
    return {
      enabled: toggleRiskControlRes.enabled
    };
  }

}