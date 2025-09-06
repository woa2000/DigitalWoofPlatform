// ============================================================================
// Repository Index - Campaign Library
// ============================================================================

export { CampaignTemplateRepository } from './CampaignTemplateRepository';
export { UserCampaignRepository } from './UserCampaignRepository';
export { CampaignPerformanceRepository } from './CampaignPerformanceRepository';
export { VisualAssetsRepository } from './VisualAssetsRepository';

// Factory function to create all repositories with a single database instance
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CampaignTemplateRepository } from './CampaignTemplateRepository';
import { UserCampaignRepository } from './UserCampaignRepository';
import { CampaignPerformanceRepository } from './CampaignPerformanceRepository';
import { VisualAssetsRepository } from './VisualAssetsRepository';

export interface CampaignRepositories {
  campaignTemplates: CampaignTemplateRepository;
  userCampaigns: UserCampaignRepository;
  performance: CampaignPerformanceRepository;
  visualAssets: VisualAssetsRepository;
}

export function createCampaignRepositories(db: PostgresJsDatabase<any>): CampaignRepositories {
  return {
    campaignTemplates: new CampaignTemplateRepository(db),
    userCampaigns: new UserCampaignRepository(db),
    performance: new CampaignPerformanceRepository(db),
    visualAssets: new VisualAssetsRepository(db)
  };
}