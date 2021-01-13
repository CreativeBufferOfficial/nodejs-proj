import { RiskControlGlobalConfig } from './../../data/database';

import { IRiskControlRepository } from './RiskControl.interfaces';

export class RiskControlRepository implements IRiskControlRepository {
  getRiskControlConfig(): Promise<RiskControlGlobalConfig | null> {
    return RiskControlGlobalConfig.findOne();
  }
  async toggleRiskControl({ enabled }: { enabled: boolean; }): Promise<RiskControlGlobalConfig | undefined> {
    const riskControlGlobalConfig = await RiskControlGlobalConfig.findOne();
    if (riskControlGlobalConfig) {
      riskControlGlobalConfig.enabled = enabled;
      await riskControlGlobalConfig.save();
      return riskControlGlobalConfig;
    }
    return undefined;
  }

}