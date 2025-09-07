// ============================================================================
// Repository Index - Campaign Library & User Profiles
// ============================================================================

export { CampaignTemplateRepository } from './CampaignTemplateRepository';
export { UserCampaignRepository } from './UserCampaignRepository';
export { CampaignPerformanceRepository } from './CampaignPerformanceRepository';
export { ProfileRepository } from './ProfileRepository';

// Factory function to create all repositories with a single database instance
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { CampaignTemplateRepository } from './CampaignTemplateRepository';
import { UserCampaignRepository } from './UserCampaignRepository';
import { CampaignPerformanceRepository } from './CampaignPerformanceRepository';
import { ProfileRepository } from './ProfileRepository';

export interface CampaignRepositories {
  campaignTemplates: CampaignTemplateRepository;
  userCampaigns: UserCampaignRepository;
  performance: CampaignPerformanceRepository;
}

export interface AllRepositories extends CampaignRepositories {
  profiles: ProfileRepository;
}

export function createCampaignRepositories(db: PostgresJsDatabase<any>): CampaignRepositories {
  return {
    campaignTemplates: new CampaignTemplateRepository(db),
    userCampaigns: new UserCampaignRepository(db),
    performance: new CampaignPerformanceRepository(db)
  };
}

export function createAllRepositories(db: PostgresJsDatabase<any>): AllRepositories {
  return {
    ...createCampaignRepositories(db),
    profiles: new ProfileRepository()
  };
}