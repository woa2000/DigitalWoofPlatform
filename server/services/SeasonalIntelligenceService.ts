import { SeasonalityKnowledgeBase, SeasonalityItem, BusinessType, ContentSuggestion, SeasonalEventType } from '../../shared/types/calendar.js';
import fs from 'fs/promises';
import path from 'path';

export interface SeasonalSuggestion {
  event: SeasonalityItem;
  content_themes: string[];
  recommended_timing: Date[];
  frequency: number;
  priority: number;
  copy_guidelines: string[];
  compliance_flags: string[];
}

export interface Location {
  state?: string;
  region?: 'N' | 'NE' | 'CO' | 'SE' | 'S';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export class SeasonalIntelligenceService {
  private knowledgeBase: SeasonalityKnowledgeBase | null = null;
  private readonly KB_PATH = path.join(process.cwd(), 'data', 'seasonality.br-pet.json');

  constructor() {
    this.loadKnowledgeBase();
  }

  /**
   * Load seasonality knowledge base from JSON file
   */
  private async loadKnowledgeBase(): Promise<void> {
    try {
      const kbData = await fs.readFile(this.KB_PATH, 'utf-8');
      this.knowledgeBase = JSON.parse(kbData);
      console.log(`[SeasonalIntelligence] Knowledge base v${this.knowledgeBase?.version} loaded successfully`);
    } catch (error) {
      console.error('[SeasonalIntelligence] Failed to load knowledge base:', error);
      throw new Error('Seasonality knowledge base not available');
    }
  }

  /**
   * Get seasonal suggestions for a business type and time period
   */
  async getSeasonalSuggestions(
    businessType: BusinessType,
    period: DateRange,
    location?: Location
  ): Promise<SeasonalSuggestion[]> {
    if (!this.knowledgeBase) {
      await this.loadKnowledgeBase();
    }

    if (!this.knowledgeBase) {
      throw new Error('Knowledge base not available');
    }

    // 1. Identify current season and upcoming events
    const upcomingEvents = await this.getUpcomingEvents(period, businessType, location);
    
    // 2. Generate content suggestions based on events
    const suggestions = upcomingEvents.map(event => ({
      event,
      content_themes: event.content_themes,
      recommended_timing: this.calculateOptimalTiming(event, period),
      frequency: event.recommended_frequency,
      priority: event.priority_score,
      copy_guidelines: event.copy_guidelines,
      compliance_flags: event.compliance_flags
    }));

    // 3. Rank suggestions by relevance
    return this.rankSuggestions(suggestions, businessType, period);
  }

  /**
   * Get upcoming seasonal events for a period
   */
  private async getUpcomingEvents(
    period: DateRange, 
    businessType: BusinessType, 
    location?: Location
  ): Promise<SeasonalityItem[]> {
    if (!this.knowledgeBase) {
      throw new Error('Knowledge base not available');
    }

    const months = this.getMonthsInPeriod(period);
    
    const relevantEvents = this.knowledgeBase.items.filter(event => {
      // Check if event occurs in the period
      const eventInPeriod = this.isEventInPeriod(event, months);
      if (!eventInPeriod) return false;

      // Check business type relevance
      const businessTypeMatch = event.business_types.includes(businessType) || 
                               event.business_types.length === 0;
      if (!businessTypeMatch) return false;

      // Check regional relevance
      const regionMatch = this.isRegionMatch(event, location);
      if (!regionMatch) return false;

      return true;
    });

    return relevantEvents;
  }

  /**
   * Check if event occurs in the given period
   */
  private isEventInPeriod(event: SeasonalityItem, months: number[]): boolean {
    if (event.movable) {
      // For movable events, we need to calculate the actual date
      // For now, we'll include them if they might occur in the period
      return true;
    }

    // For fixed events, check if the month is in our period
    return months.includes(event.month);
  }

  /**
   * Check if event is relevant for the location
   */
  private isRegionMatch(event: SeasonalityItem, location?: Location): boolean {
    if (!location || !location.region) {
      // If no location specified, include all events
      return true;
    }

    // Check if event applies to the region
    return event.regions.includes('BR') || event.regions.includes(location.region);
  }

  /**
   * Get months covered by a date range
   */
  private getMonthsInPeriod(period: DateRange): number[] {
    const months: number[] = [];
    const current = new Date(period.start);
    
    while (current <= period.end) {
      const month = current.getMonth() + 1; // JavaScript months are 0-indexed
      if (!months.includes(month)) {
        months.push(month);
      }
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }

  /**
   * Calculate optimal timing for a seasonal event
   */
  private calculateOptimalTiming(event: SeasonalityItem, period: DateRange): Date[] {
    const timingDates: Date[] = [];
    
    if (event.movable) {
      // For movable events, calculate based on the calculation rule
      const eventDate = this.calculateMovableEventDate(event, period.start.getFullYear());
      if (eventDate && eventDate >= period.start && eventDate <= period.end) {
        // Add some dates leading up to the event
        const leadDays = [14, 7, 3, 1]; // 2 weeks, 1 week, 3 days, 1 day before
        leadDays.forEach(days => {
          const leadDate = new Date(eventDate);
          leadDate.setDate(leadDate.getDate() - days);
          if (leadDate >= period.start && leadDate <= period.end) {
            timingDates.push(leadDate);
          }
        });
        timingDates.push(eventDate);
      }
    } else {
      // For fixed events, create dates for the specified day
      const currentYear = period.start.getFullYear();
      const endYear = period.end.getFullYear();
      
      for (let year = currentYear; year <= endYear; year++) {
        if (event.date) {
          const eventDate = new Date(year, event.month - 1, event.date);
          if (eventDate >= period.start && eventDate <= period.end) {
            timingDates.push(eventDate);
          }
        } else {
          // If no specific date, suggest middle of the month
          const eventDate = new Date(year, event.month - 1, 15);
          if (eventDate >= period.start && eventDate <= period.end) {
            timingDates.push(eventDate);
          }
        }
      }
    }

    return timingDates.sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * Calculate date for movable events (Easter, Carnival, etc.)
   */
  private calculateMovableEventDate(event: SeasonalityItem, year: number): Date | null {
    if (!event.calculation) return null;

    if (event.calculation === 'easter') {
      return this.calculateEaster(year);
    }
    
    if (event.calculation.includes('easter')) {
      const easterDate = this.calculateEaster(year);
      if (!easterDate) return null;
      
      // Parse calculations like "easter - 47 days"
      const match = event.calculation.match(/easter\s*([+-])\s*(\d+)\s*days?/);
      if (match) {
        const operator = match[1];
        const days = parseInt(match[2]);
        const resultDate = new Date(easterDate);
        
        if (operator === '+') {
          resultDate.setDate(resultDate.getDate() + days);
        } else {
          resultDate.setDate(resultDate.getDate() - days);
        }
        
        return resultDate;
      }
    }
    
    if (event.calculation === 'second sunday of may') {
      return this.getNthWeekdayOfMonth(year, 4, 0, 2); // May (4), Sunday (0), 2nd occurrence
    }
    
    if (event.calculation === 'second sunday of august') {
      return this.getNthWeekdayOfMonth(year, 7, 0, 2); // August (7), Sunday (0), 2nd occurrence
    }
    
    if (event.calculation === 'fourth friday of november') {
      return this.getNthWeekdayOfMonth(year, 10, 5, 4); // November (10), Friday (5), 4th occurrence
    }

    return null;
  }

  /**
   * Calculate Easter date using the algorithm
   */
  private calculateEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;
    
    return new Date(year, n - 1, p + 1);
  }

  /**
   * Get the nth occurrence of a weekday in a month
   */
  private getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    
    let daysUntilTargetWeekday = (weekday - firstWeekday + 7) % 7;
    let targetDate = 1 + daysUntilTargetWeekday + (n - 1) * 7;
    
    return new Date(year, month, targetDate);
  }

  /**
   * Rank suggestions by relevance and priority
   */
  private rankSuggestions(
    suggestions: SeasonalSuggestion[], 
    businessType: BusinessType, 
    period: DateRange
  ): SeasonalSuggestion[] {
    const currentDate = new Date();
    
    return suggestions.sort((a, b) => {
      // 1. Priority score (higher is better)
      const priorityDiff = b.priority - a.priority;
      if (priorityDiff !== 0) return priorityDiff;
      
      // 2. Timing relevance (closer to current date is better)
      const aMinDistance = Math.min(...a.recommended_timing.map(date => 
        Math.abs(date.getTime() - currentDate.getTime())
      ));
      const bMinDistance = Math.min(...b.recommended_timing.map(date => 
        Math.abs(date.getTime() - currentDate.getTime())
      ));
      
      const timingDiff = aMinDistance - bMinDistance;
      if (timingDiff !== 0) return timingDiff;
      
      // 3. Business type specificity (more specific is better)
      const aSpecificity = a.event.business_types.length;
      const bSpecificity = b.event.business_types.length;
      
      return aSpecificity - bSpecificity;
    });
  }

  /**
   * Generate content suggestions from seasonal events
   */
  async generateContentSuggestions(
    businessType: BusinessType,
    period: DateRange,
    location?: Location,
    maxSuggestions: number = 10
  ): Promise<ContentSuggestion[]> {
    const seasonalSuggestions = await this.getSeasonalSuggestions(businessType, period, location);
    const contentSuggestions: ContentSuggestion[] = [];
    
    for (const seasonal of seasonalSuggestions.slice(0, maxSuggestions)) {
      for (const theme of seasonal.content_themes.slice(0, 2)) { // Max 2 themes per event
        for (const timing of seasonal.recommended_timing.slice(0, 1)) { // Max 1 timing per theme
          contentSuggestions.push({
            id: `seasonal-${seasonal.event.id}-${theme}-${timing.getTime()}`,
            type: 'seasonal',
            content_type: this.mapThemeToContentType(theme),
            title: this.generateTitle(seasonal.event, theme, businessType),
            description: this.generateDescription(seasonal.event, theme, seasonal.copy_guidelines),
            suggested_date: timing,
            seasonal_event_id: seasonal.event.id,
            confidence_score: this.calculateConfidenceScore(seasonal),
            reasoning: `Baseado no evento sazonal "${seasonal.event.name}" relevante para ${businessType}`
          });
        }
      }
    }
    
    return contentSuggestions.slice(0, maxSuggestions);
  }

  /**
   * Map content theme to content type
   */
  private mapThemeToContentType(theme: string): 'educativo' | 'promocional' | 'recall' | 'engajamento' | 'awareness' {
    const themeMap: Record<string, 'educativo' | 'promocional' | 'recall' | 'engajamento' | 'awareness'> = {
      'hidratacao': 'educativo',
      'protecao_solar': 'educativo',
      'enriquecimento_ambiental': 'educativo',
      'tosquia': 'promocional',
      'hospedagem': 'promocional',
      'adestramento': 'educativo',
      'toxicidade_chocolate': 'educativo',
      'petiscos_seguros': 'promocional',
      'familia_pets': 'engajamento',
      'spa_pets': 'promocional',
      'presentes': 'promocional',
      'fantasias_pets': 'promocional',
      'promocoes': 'promocional',
      'check_ups': 'recall',
      'prevencao': 'educativo',
      'bem_estar_animal': 'awareness',
      'adocao_responsavel': 'awareness'
    };
    
    return themeMap[theme] || 'educativo';
  }

  /**
   * Generate title for content suggestion
   */
  private generateTitle(event: SeasonalityItem, theme: string, businessType: BusinessType): string {
    const titleTemplates: Record<string, string[]> = {
      'hidratacao': [
        'Hidratação no {season}: dicas essenciais para seu pet',
        'Água fresca sempre: cuidados especiais no {season}',
        'Mantenha seu pet hidratado durante o {season}'
      ],
      'protecao_solar': [
        'Proteção solar para pets: cuidados no verão',
        'Sol forte? Proteja seu pet com estas dicas'
      ],
      'toxicidade_chocolate': [
        'Páscoa Segura: por que chocolate é perigoso para pets',
        'Chocolate e pets: o que você precisa saber'
      ],
      'check_ups': [
        'Outubro Rosa Pet: a importância dos check-ups',
        'Prevenção em primeiro lugar: agende o check-up'
      ]
    };

    const templates = titleTemplates[theme] || [`Dicas especiais para ${event.name}`];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template.replace('{season}', this.getSeasonName(event.month));
  }

  /**
   * Generate description for content suggestion
   */
  private generateDescription(event: SeasonalityItem, theme: string, guidelines: string[]): string {
    if (guidelines.length > 0) {
      return guidelines[0]; // Use first guideline as description
    }
    
    return `Conteúdo relevante para ${event.name} focado em ${theme}`;
  }

  /**
   * Get season name from month
   */
  private getSeasonName(month: number): string {
    if (month >= 3 && month <= 5) return 'outono';
    if (month >= 6 && month <= 8) return 'inverno';
    if (month >= 9 && month <= 11) return 'primavera';
    return 'verão';
  }

  /**
   * Calculate confidence score for seasonal suggestion
   */
  private calculateConfidenceScore(seasonal: SeasonalSuggestion): number {
    let score = 0.5; // Base score
    
    // Higher priority events get higher confidence
    score += (seasonal.priority / 10) * 0.3;
    
    // Events with specific copy guidelines get higher confidence
    if (seasonal.copy_guidelines.length > 0) {
      score += 0.2;
    }
    
    // Events with multiple content themes get slightly higher confidence
    score += Math.min(seasonal.content_themes.length / 10, 0.1);
    
    return Math.min(score, 1.0);
  }

  /**
   * Get current season based on date and location
   */
  getCurrentSeason(date: Date = new Date(), location?: Location): string {
    const month = date.getMonth() + 1;
    
    // Brazilian seasons (Southern Hemisphere)
    if (month >= 12 || month <= 2) return 'verão';
    if (month >= 3 && month <= 5) return 'outono';
    if (month >= 6 && month <= 8) return 'inverno';
    return 'primavera';
  }

  /**
   * Refresh knowledge base (reload from file)
   */
  async refreshKnowledgeBase(): Promise<void> {
    this.knowledgeBase = null;
    await this.loadKnowledgeBase();
  }

  /**
   * Get knowledge base version info
   */
  getKnowledgeBaseInfo(): { version?: string; itemCount: number; lastUpdated?: string } {
    if (!this.knowledgeBase) {
      return { itemCount: 0 };
    }
    
    return {
      version: this.knowledgeBase.version,
      itemCount: this.knowledgeBase.items.length,
      lastUpdated: this.knowledgeBase.last_updated
    };
  }
}