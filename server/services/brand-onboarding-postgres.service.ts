import pg from 'pg';
import crypto from 'crypto';

const { Client } = pg;

export interface OnboardingData {
  logoUrl?: string;
  palette?: any;
  logoMetadata?: any;
  toneConfig?: any;
  languageConfig?: any;
  brandValues?: any;
  stepCompleted?: 'logo' | 'palette' | 'tone' | 'language' | 'values' | 'completed';
}

export class BrandOnboardingPostgresService {
  private static async getClient() {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    await client.connect();
    return client;
  }

  /**
   * Get onboarding data for a user
   */
  static async getByUserId(userId: string) {
    const client = await this.getClient();
    try {
      console.log(`🔍 Getting onboarding data for user: ${userId}`);

      const result = await client.query(
        'SELECT * FROM brand_onboarding WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        console.log('📊 No onboarding data found for user');
        return null;
      }

      console.log('✅ Onboarding data retrieved successfully');
      return result.rows[0];
    } catch (error) {
      console.error('❌ Database error in getByUserId:', error);
      throw new Error('Failed to fetch onboarding data');
    } finally {
      await client.end();
    }
  }

  /**
   * Create new onboarding record
   */
  static async create(userId: string, data: OnboardingData, tenantId?: string) {
    const client = await this.getClient();
    try {
      console.log(`📝 Creating onboarding record for user: ${userId}${tenantId ? ` in tenant: ${tenantId}` : ''}`);

      const recordId = crypto.randomUUID();
      const query = `
        INSERT INTO brand_onboarding (
          id,
          user_id,
          tenant_id,
          logo_url,
          palette,
          logo_metadata,
          tone_config,
          language_config,
          brand_values,
          step_completed,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        recordId,
        userId,
        tenantId || null,
        data.logoUrl || null,
        data.palette ? JSON.stringify(data.palette) : null,
        data.logoMetadata ? JSON.stringify(data.logoMetadata) : null,
        data.toneConfig ? JSON.stringify(data.toneConfig) : null,
        data.languageConfig ? JSON.stringify(data.languageConfig) : null,
        data.brandValues ? JSON.stringify(data.brandValues) : null,
        data.stepCompleted || null
      ];

      const result = await client.query(query, values);

      console.log('✅ Onboarding record created successfully');
      return result.rows[0];
    } catch (error) {
      console.error('❌ Database error in create:', error);
      throw new Error('Failed to create onboarding record');
    } finally {
      await client.end();
    }
  }

  /**
   * Update existing onboarding record
   */
  static async update(userId: string, data: Partial<OnboardingData>, tenantId?: string) {
    const client = await this.getClient();
    try {
      console.log(`📝 Updating onboarding record for user: ${userId}${tenantId ? ` in tenant: ${tenantId}` : ''}`);

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (data.logoUrl !== undefined) {
        updateFields.push(`logo_url = $${paramIndex++}`);
        values.push(data.logoUrl);
      }
      if (data.palette !== undefined) {
        updateFields.push(`palette = $${paramIndex++}`);
        values.push(data.palette ? JSON.stringify(data.palette) : null);
      }
      if (data.logoMetadata !== undefined) {
        updateFields.push(`logo_metadata = $${paramIndex++}`);
        values.push(data.logoMetadata ? JSON.stringify(data.logoMetadata) : null);
      }
      if (data.toneConfig !== undefined) {
        updateFields.push(`tone_config = $${paramIndex++}`);
        values.push(data.toneConfig ? JSON.stringify(data.toneConfig) : null);
      }
      if (data.languageConfig !== undefined) {
        updateFields.push(`language_config = $${paramIndex++}`);
        values.push(data.languageConfig ? JSON.stringify(data.languageConfig) : null);
      }
      if (data.brandValues !== undefined) {
        updateFields.push(`brand_values = $${paramIndex++}`);
        values.push(data.brandValues ? JSON.stringify(data.brandValues) : null);
      }
      if (data.stepCompleted !== undefined) {
        updateFields.push(`step_completed = $${paramIndex++}`);
        values.push(data.stepCompleted);
      }
      if (tenantId !== undefined) {
        updateFields.push(`tenant_id = $${paramIndex++}`);
        values.push(tenantId);
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE brand_onboarding 
        SET ${updateFields.join(', ')}
        WHERE user_id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        console.log('📊 No onboarding data found to update');
        return null;
      }

      console.log('✅ Onboarding record updated successfully');
      return result.rows[0];
    } catch (error) {
      console.error('❌ Database error in update:', error);
      throw new Error('Failed to update onboarding record');
    } finally {
      await client.end();
    }
  }

  /**
   * Upsert onboarding data (create or update)
   */
  static async upsert(userId: string, data: OnboardingData, tenantId?: string) {
    try {
      console.log(`📝 Upserting onboarding data for user: ${userId}`);

      const existing = await this.getByUserId(userId);

      if (existing) {
        return await this.update(userId, data, tenantId) || existing;
      } else {
        return await this.create(userId, data, tenantId);
      }
    } catch (error) {
      console.error('❌ Database error in upsert:', error);
      throw new Error('Failed to save onboarding data');
    }
  }

  /**
   * Mark onboarding as completed
   */
  static async complete(userId: string) {
    try {
      console.log(`🎉 Completing onboarding for user: ${userId}`);

      const updated = await this.update(userId, { stepCompleted: 'completed' });

      if (!updated) {
        return null;
      }

      // Format data for Brand Voice JSON
      const brandVoiceData = {
        tone: updated.tone_config,
        language: updated.language_config,
        values: updated.brand_values
      };

      return {
        onboarding: updated,
        brandVoiceData
      };
    } catch (error) {
      console.error('❌ Database error in complete:', error);
      throw new Error('Failed to complete onboarding');
    }
  }

  /**
   * Delete onboarding data
   */
  static async delete(userId: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      console.log(`🗑️ Deleting onboarding data for user: ${userId}`);

      const result = await client.query(
        'DELETE FROM brand_onboarding WHERE user_id = $1',
        [userId]
      );

      console.log('✅ Onboarding data deleted successfully');
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('❌ Database error in delete:', error);
      throw new Error('Failed to delete onboarding data');
    } finally {
      await client.end();
    }
  }
}