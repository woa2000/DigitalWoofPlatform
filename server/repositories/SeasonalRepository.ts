import pg from 'pg';
import { SeasonalityItem } from '../../shared/types/calendar.js';

const { Pool } = pg;
type PoolType = typeof Pool;

export interface SeasonalKnowledgeRecord {
  id: string;
  name: string;
  type: string;
  month: number;
  date?: number;
  movable: boolean;
  calculation?: string;
  content_themes: string[];
  business_types: string[];
  regions: string[];
  priority_score: number;
  recommended_frequency: number;
  copy_guidelines: string[];
  compliance_flags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface SeasonalAnalytics {
  event_id: string;
  usage_count: number;
  success_rate: number;
  avg_engagement: number;
  last_used_at?: Date;
}

export class SeasonalRepository {
  constructor(private db: any) {} // TODO: Fix types after pg module import issues

  /**
   * Sync seasonal knowledge base with database
   */
  async syncKnowledgeBase(items: SeasonalityItem[]): Promise<void> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear existing data
      await client.query('DELETE FROM seasonal_knowledge');
      
      // Insert new data
      for (const item of items) {
        await client.query(`
          INSERT INTO seasonal_knowledge (
            id, name, type, month, date, movable, calculation,
            content_themes, business_types, regions, priority_score,
            recommended_frequency, copy_guidelines, compliance_flags
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          item.id,
          item.name,
          item.event_type,
          item.month,
          item.date || null,
          item.movable,
          item.calculation || null,
          JSON.stringify(item.content_themes),
          JSON.stringify(item.business_types),
          JSON.stringify(item.regions),
          item.priority_score,
          item.recommended_frequency,
          JSON.stringify(item.copy_guidelines),
          JSON.stringify(item.compliance_flags)
        ]);
      }
      
      await client.query('COMMIT');
      console.log(`[SeasonalRepository] Synced ${items.length} seasonal knowledge items`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[SeasonalRepository] Error syncing knowledge base:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get seasonal knowledge items by criteria
   */
  async getSeasonalKnowledge(criteria: {
    months?: number[];
    businessTypes?: string[];
    regions?: string[];
    type?: string;
    minPriority?: number;
  }): Promise<SeasonalKnowledgeRecord[]> {
    let query = 'SELECT * FROM seasonal_knowledge WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (criteria.months && criteria.months.length > 0) {
      query += ` AND month = ANY($${paramIndex})`;
      params.push(criteria.months);
      paramIndex++;
    }

    if (criteria.businessTypes && criteria.businessTypes.length > 0) {
      query += ` AND business_types ?| array[$${paramIndex}]`;
      params.push(criteria.businessTypes);
      paramIndex++;
    }

    if (criteria.regions && criteria.regions.length > 0) {
      query += ` AND regions ?| array[$${paramIndex}]`;
      params.push(criteria.regions);
      paramIndex++;
    }

    if (criteria.type) {
      query += ` AND type = $${paramIndex}`;
      params.push(criteria.type);
      paramIndex++;
    }

    if (criteria.minPriority !== undefined) {
      query += ` AND priority_score >= $${paramIndex}`;
      params.push(criteria.minPriority);
      paramIndex++;
    }

    query += ' ORDER BY priority_score DESC, month ASC';

    const result = await this.db.query(query, params);
    
    return result.rows.map(row => ({
      ...row,
      content_themes: JSON.parse(row.content_themes),
      business_types: JSON.parse(row.business_types),
      regions: JSON.parse(row.regions),
      copy_guidelines: JSON.parse(row.copy_guidelines),
      compliance_flags: JSON.parse(row.compliance_flags)
    }));
  }

  /**
   * Record seasonal suggestion usage
   */
  async recordSeasonalUsage(
    eventId: string,
    calendarItemId: string,
    businessType: string,
    success: boolean
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO seasonal_analytics (
        event_id, calendar_item_id, business_type, success, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [eventId, calendarItemId, businessType, success]);
  }

  /**
   * Get seasonal analytics for performance tracking
   */
  async getSeasonalAnalytics(eventId?: string): Promise<SeasonalAnalytics[]> {
    let query = `
      SELECT 
        event_id,
        COUNT(*) as usage_count,
        AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as success_rate,
        AVG(engagement_score) as avg_engagement,
        MAX(created_at) as last_used_at
      FROM seasonal_analytics sa
      LEFT JOIN calendar_analytics ca ON sa.calendar_item_id = ca.calendar_item_id
    `;
    const params: string[] = [];

    if (eventId) {
      query += ' WHERE sa.event_id = $1';
      params.push(eventId);
    }

    query += ' GROUP BY event_id ORDER BY usage_count DESC';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  /**
   * Get most successful seasonal events by business type
   */
  async getTopSeasonalEvents(
    businessType: string,
    limit: number = 10
  ): Promise<Array<SeasonalKnowledgeRecord & SeasonalAnalytics>> {
    const result = await this.db.query(`
      SELECT 
        sk.*,
        COALESCE(COUNT(sa.id), 0) as usage_count,
        COALESCE(AVG(CASE WHEN sa.success THEN 1.0 ELSE 0.0 END), 0) as success_rate,
        COALESCE(AVG(ca.engagement_score), 0) as avg_engagement,
        MAX(sa.created_at) as last_used_at
      FROM seasonal_knowledge sk
      LEFT JOIN seasonal_analytics sa ON sk.id = sa.event_id AND sa.business_type = $1
      LEFT JOIN calendar_analytics ca ON sa.calendar_item_id = ca.calendar_item_id
      WHERE sk.business_types @> $2 OR sk.business_types = '[]'::jsonb
      GROUP BY sk.id
      ORDER BY 
        COALESCE(AVG(CASE WHEN sa.success THEN 1.0 ELSE 0.0 END), 0) DESC,
        sk.priority_score DESC
      LIMIT $3
    `, [businessType, JSON.stringify([businessType]), limit]);

    return result.rows.map(row => ({
      ...row,
      content_themes: JSON.parse(row.content_themes),
      business_types: JSON.parse(row.business_types),
      regions: JSON.parse(row.regions),
      copy_guidelines: JSON.parse(row.copy_guidelines),
      compliance_flags: JSON.parse(row.compliance_flags)
    }));
  }

  /**
   * Update seasonal knowledge item
   */
  async updateSeasonalKnowledge(
    id: string,
    updates: Partial<Omit<SeasonalKnowledgeRecord, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SeasonalKnowledgeRecord | null> {
    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = $${paramIndex}`);
        
        // Handle JSON fields
        if (['content_themes', 'business_types', 'regions', 'copy_guidelines', 'compliance_flags'].includes(key)) {
          params.push(JSON.stringify(value));
        } else {
          params.push(value);
        }
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      return null;
    }

    setClause.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE seasonal_knowledge 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, params);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      content_themes: JSON.parse(row.content_themes),
      business_types: JSON.parse(row.business_types),
      regions: JSON.parse(row.regions),
      copy_guidelines: JSON.parse(row.copy_guidelines),
      compliance_flags: JSON.parse(row.compliance_flags)
    };
  }

  /**
   * Delete seasonal knowledge item
   */
  async deleteSeasonalKnowledge(id: string): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM seasonal_knowledge WHERE id = $1',
      [id]
    );
    
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get seasonal trends for business intelligence
   */
  async getSeasonalTrends(
    businessType: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    month: number;
    event_count: number;
    avg_engagement: number;
    most_popular_themes: string[];
  }>> {
    const result = await this.db.query(`
      SELECT 
        sk.month,
        COUNT(DISTINCT sk.id) as event_count,
        COALESCE(AVG(ca.engagement_score), 0) as avg_engagement,
        array_agg(DISTINCT theme) FILTER (WHERE theme IS NOT NULL) as themes
      FROM seasonal_knowledge sk
      LEFT JOIN seasonal_analytics sa ON sk.id = sa.event_id 
        AND sa.business_type = $1
        AND sa.created_at BETWEEN $2 AND $3
      LEFT JOIN calendar_analytics ca ON sa.calendar_item_id = ca.calendar_item_id
      CROSS JOIN LATERAL jsonb_array_elements_text(sk.content_themes) as theme
      WHERE sk.business_types @> $4 OR sk.business_types = '[]'::jsonb
      GROUP BY sk.month
      ORDER BY sk.month
    `, [businessType, startDate, endDate, JSON.stringify([businessType])]);

    return result.rows.map(row => ({
      month: row.month,
      event_count: parseInt(row.event_count),
      avg_engagement: parseFloat(row.avg_engagement),
      most_popular_themes: row.themes || []
    }));
  }

  /**
   * Search seasonal knowledge by keywords
   */
  async searchSeasonalKnowledge(
    keywords: string[],
    businessType?: string,
    limit: number = 20
  ): Promise<SeasonalKnowledgeRecord[]> {
    const searchTerms = keywords.map(k => k.toLowerCase().trim()).filter(k => k.length > 0);
    
    if (searchTerms.length === 0) {
      return [];
    }

    let query = `
      SELECT *, 
        (CASE 
          WHEN lower(name) LIKE ANY($1) THEN 3
          WHEN content_themes::text ILIKE ANY($1) THEN 2
          WHEN copy_guidelines::text ILIKE ANY($1) THEN 1
          ELSE 0
        END) as relevance_score
      FROM seasonal_knowledge
      WHERE (
        lower(name) LIKE ANY($1) OR
        content_themes::text ILIKE ANY($1) OR
        copy_guidelines::text ILIKE ANY($1)
      )
    `;
    
    const params: any[] = [searchTerms.map(term => `%${term}%`)];
    let paramIndex = 2;

    if (businessType) {
      query += ` AND (business_types @> $${paramIndex} OR business_types = '[]'::jsonb)`;
      params.push(JSON.stringify([businessType]));
      paramIndex++;
    }

    query += ` ORDER BY relevance_score DESC, priority_score DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await this.db.query(query, params);
    
    return result.rows.map(row => ({
      ...row,
      content_themes: JSON.parse(row.content_themes),
      business_types: JSON.parse(row.business_types),
      regions: JSON.parse(row.regions),
      copy_guidelines: JSON.parse(row.copy_guidelines),
      compliance_flags: JSON.parse(row.compliance_flags)
    }));
  }
}