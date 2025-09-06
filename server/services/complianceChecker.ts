import { readFileSync } from 'fs';
import { join } from 'path';

export interface ComplianceRule {
  id: string;
  trigger: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  applies_to: string[];
}

export interface ComplianceResult {
  isCompliant: boolean;
  issues: string[];
  suggestions: string[];
  warnings: string[];
  score: number;
}

export class ComplianceChecker {
  private rules: ComplianceRule[] = [];

  constructor() {
    this.loadRules();
  }

  private loadRules(): void {
    try {
      const rulesPath = join(process.cwd(), 'compliance', 'pet.rules.json');
      const rulesData = readFileSync(rulesPath, 'utf-8');
      const rulesConfig = JSON.parse(rulesData);
      this.rules = rulesConfig.rules || [];
    } catch (error) {
      console.warn('Could not load compliance rules, using defaults:', error);
      this.loadDefaultRules();
    }
  }

  private loadDefaultRules(): void {
    this.rules = [
      {
        id: 'no-cure-claims',
        trigger: 'cura|curar|curam|100% eficaz|garantia de cura',
        severity: 'error',
        message: 'Não são permitidas promessas de cura',
        suggestion: 'Use termos como "pode ajudar" ou "contribui para"',
        applies_to: ['all']
      },
      {
        id: 'vet-disclaimer',
        trigger: 'diagnóstico|diagnóstica|prescreve|receita médica|tratamento de',
        severity: 'warning',
        message: 'Conteúdo médico requer disclaimer veterinário',
        suggestion: 'Adicione: "Consulte sempre um veterinário para orientações específicas"',
        applies_to: ['all']
      },
      {
        id: 'prefer-tutor',
        trigger: '\\bdono\\b|\\bdonos\\b',
        severity: 'info',
        message: 'Prefira usar "tutor" ao invés de "dono"',
        suggestion: 'Substitua "dono" por "tutor"',
        applies_to: ['all']
      },
      {
        id: 'no-fear-tactics',
        trigger: 'pode morrer|vai morrer|fatal se não|urgente caso contrário',
        severity: 'warning',
        message: 'Evite criar medo desnecessário',
        suggestion: 'Use linguagem mais acolhedora e informativa',
        applies_to: ['all']
      },
      {
        id: 'medication-disclaimer',
        trigger: 'medicamento|remédio|antibiótico|anti-inflamatório',
        severity: 'warning',
        message: 'Menções a medicamentos requerem disclaimer',
        suggestion: 'Adicione disclaimer sobre prescrição veterinária',
        applies_to: ['veterinaria', 'clinica']
      }
    ];
  }

  async checkContent(
    content: string,
    segment: string
  ): Promise<ComplianceResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let violationCount = 0;

    for (const rule of this.rules) {
      // Check if rule applies to this segment
      if (!rule.applies_to.includes('all') && !rule.applies_to.includes(segment)) {
        continue;
      }

      // Check if trigger pattern matches
      const regex = new RegExp(rule.trigger, 'gi');
      if (regex.test(content)) {
        violationCount++;

        switch (rule.severity) {
          case 'error':
            issues.push(rule.message);
            if (rule.suggestion) {
              suggestions.push(rule.suggestion);
            }
            break;
          case 'warning':
            warnings.push(rule.message);
            if (rule.suggestion) {
              suggestions.push(rule.suggestion);
            }
            break;
          case 'info':
            if (rule.suggestion) {
              suggestions.push(rule.suggestion);
            }
            break;
        }
      }
    }

    // Calculate compliance score
    const errorWeight = 0.4;
    const warningWeight = 0.2;
    const maxViolations = this.rules.length;
    
    const errorCount = issues.length;
    const warningCount = warnings.length;
    
    let score = 1.0;
    if (maxViolations > 0) {
      score = Math.max(0, 1.0 - 
        (errorCount * errorWeight + warningCount * warningWeight) / maxViolations
      );
    }

    return {
      isCompliant: issues.length === 0,
      issues,
      suggestions,
      warnings,
      score: Number(score.toFixed(2))
    };
  }

  async checkBatch(
    contents: { id: string; content: string; segment: string }[]
  ): Promise<Map<string, ComplianceResult>> {
    const results = new Map<string, ComplianceResult>();
    
    for (const item of contents) {
      try {
        const result = await this.checkContent(item.content, item.segment);
        results.set(item.id, result);
      } catch (error) {
        console.error(`Compliance check failed for ${item.id}:`, error);
        results.set(item.id, {
          isCompliant: false,
          issues: ['Compliance check failed'],
          suggestions: [],
          warnings: [],
          score: 0
        });
      }
    }
    
    return results;
  }

  getRules(): ComplianceRule[] {
    return [...this.rules];
  }

  addRule(rule: ComplianceRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleId: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
    return this.rules.length < initialLength;
  }

  updateRule(ruleId: string, updates: Partial<ComplianceRule>): boolean {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) {
      return false;
    }
    
    this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    return true;
  }
}