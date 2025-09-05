export interface ComplianceRule {
  id: string;
  category: "medical" | "promotional" | "safety" | "legal" | "ethical";
  severity: "critical" | "high" | "medium" | "low";
  rule: string;
  pattern?: RegExp;
  keywords?: string[];
  message: string;
  suggestion: string;
}

const COMPLIANCE_RULES: ComplianceRule[] = [
  // Medical Rules (Critical)
  {
    id: "no_diagnosis",
    category: "medical",
    severity: "critical",
    rule: "Proibido fazer diagnósticos",
    keywords: ["diagnostico", "diagnóstico", "tem", "é", "está com", "sofre de"],
    message: "Conteúdo contém possível diagnóstico médico",
    suggestion: "Use 'pode indicar' ou 'consulte um veterinário para diagnóstico'"
  },
  {
    id: "no_cure_promises",
    category: "medical", 
    severity: "critical",
    rule: "Proibido prometer cura",
    keywords: ["cura", "curar", "curamos", "elimina", "resolve definitivamente"],
    message: "Promessa de cura não permitida",
    suggestion: "Use 'ajuda a tratar' ou 'pode auxiliar no tratamento'"
  },
  {
    id: "medical_disclaimer",
    category: "medical",
    severity: "critical", 
    rule: "Disclaimer médico obrigatório",
    pattern: /consulte.*veterinário|veterinário.*consulte|não substitui.*consulta/i,
    message: "Disclaimer veterinário obrigatório ausente",
    suggestion: "Adicione: 'Consulte sempre um veterinário. Este conteúdo não substitui consulta profissional.'"
  },

  // Promotional Rules (High)
  {
    id: "no_superlatives",
    category: "promotional",
    severity: "high", 
    rule: "Evitar superlativos exagerados",
    keywords: ["melhor do mundo", "100% garantido", "perfeito", "infalível", "milagroso"],
    message: "Alegação promocional exagerada",
    suggestion: "Use termos mais moderados como 'excelente qualidade' ou 'alta eficácia'"
  },
  {
    id: "no_impossible_results",
    category: "promotional",
    severity: "high",
    rule: "Evitar promessas de resultados impossíveis", 
    keywords: ["resultados imediatos", "instantâneo", "24h", "sem falhas"],
    message: "Promessa de resultado impossível",
    suggestion: "Seja realista sobre tempo e resultados esperados"
  },

  // Safety Rules (High)
  {
    id: "toxic_products",
    category: "safety",
    severity: "high",
    rule: "Alertar sobre produtos tóxicos",
    keywords: ["chocolate", "cebola", "alho", "uva", "xilitol", "café"],
    message: "Menção a produto potencialmente tóxico",
    suggestion: "Adicione alerta sobre toxicidade e orientação veterinária"
  },
  {
    id: "safety_warnings",
    category: "safety", 
    severity: "medium",
    rule: "Incluir avisos de segurança",
    keywords: ["medicamento", "dosagem", "administrar", "aplicar"],
    message: "Conteúdo sobre medicação sem avisos de segurança",
    suggestion: "Inclua: 'Sempre sob orientação veterinária'"
  },

  // Legal Rules (Medium)
  {
    id: "cfmv_compliance",
    category: "legal",
    severity: "medium",
    rule: "Conformidade com CFMV",
    pattern: /receita|prescrição|medicação|tratamento/i,
    message: "Conteúdo pode violar regulamentações CFMV",
    suggestion: "Adicione disclaimer de conformidade CFMV"
  },

  // Ethical Rules (Medium)
  {
    id: "animal_welfare",
    category: "ethical", 
    severity: "medium",
    rule: "Priorizar bem-estar animal",
    keywords: ["forçar", "obrigar", "punir", "castigo"],
    message: "Conteúdo pode comprometer bem-estar animal",
    suggestion: "Enfatize métodos positivos e respeitosos"
  }
];

export interface ComplianceResult {
  isCompliant: boolean;
  score: number;
  violations: Array<{
    ruleId: string;
    category: string;
    severity: string;
    message: string;
    suggestion: string;
    confidence: number;
  }>;
}

export function checkCompliance(content: string, businessType: string): ComplianceResult {
  const violations = [];
  const contentLower = content.toLowerCase();

  for (const rule of COMPLIANCE_RULES) {
    let isViolation = false;
    let confidence = 0;

    // Check keywords
    if (rule.keywords) {
      const foundKeywords = rule.keywords.filter(keyword => 
        contentLower.includes(keyword.toLowerCase())
      );
      if (foundKeywords.length > 0) {
        isViolation = true;
        confidence = Math.min(0.9, foundKeywords.length * 0.3);
      }
    }

    // Check regex pattern
    if (rule.pattern && !rule.pattern.test(content)) {
      // For disclaimer rules, absence of pattern is a violation
      if (rule.id === "medical_disclaimer") {
        isViolation = true;
        confidence = 0.95;
      }
    }

    if (isViolation) {
      violations.push({
        ruleId: rule.id,
        category: rule.category,
        severity: rule.severity,
        message: rule.message,
        suggestion: rule.suggestion,
        confidence
      });
    }
  }

  // Calculate compliance score
  const criticalViolations = violations.filter(v => v.severity === "critical").length;
  const highViolations = violations.filter(v => v.severity === "high").length;
  const mediumViolations = violations.filter(v => v.severity === "medium").length;
  const lowViolations = violations.filter(v => v.severity === "low").length;

  let score = 100;
  score -= criticalViolations * 25; // Critical: -25 points each
  score -= highViolations * 15;     // High: -15 points each  
  score -= mediumViolations * 8;    // Medium: -8 points each
  score -= lowViolations * 3;       // Low: -3 points each

  score = Math.max(0, score);
  const isCompliant = criticalViolations === 0 && score >= 80;

  return {
    isCompliant,
    score,
    violations
  };
}

export function generateComplianceReport(contents: Array<{ id: string; content: string; type: string }>): {
  totalContent: number;
  compliantContent: number;
  complianceRate: number;
  criticalViolations: number;
  commonIssues: string[];
  recommendations: string[];
} {
  let compliantCount = 0;
  let criticalCount = 0;
  const allViolations = [];

  for (const content of contents) {
    const result = checkCompliance(content.content, "veterinaria");
    if (result.isCompliant) compliantCount++;
    
    const criticalViolations = result.violations.filter(v => v.severity === "critical");
    criticalCount += criticalViolations.length;
    allViolations.push(...result.violations);
  }

  // Find common issues
  const violationCounts = allViolations.reduce((acc, violation) => {
    acc[violation.ruleId] = (acc[violation.ruleId] || 0) + 1;
    return acc;
  }, {});

  const commonIssues = Object.entries(violationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([ruleId]) => {
      const rule = COMPLIANCE_RULES.find(r => r.id === ruleId);
      return rule?.message || ruleId;
    });

  const complianceRate = contents.length > 0 ? (compliantCount / contents.length) * 100 : 100;

  const recommendations = [
    "Adicionar disclaimers médicos em todo conteúdo de saúde",
    "Revisar alegações promocionais para evitar exageros",
    "Incluir orientações de segurança em conteúdos sobre produtos",
    "Garantir conformidade com regulamentações CFMV"
  ];

  return {
    totalContent: contents.length,
    compliantContent: compliantCount,
    complianceRate: Math.round(complianceRate * 10) / 10,
    criticalViolations: criticalCount,
    commonIssues,
    recommendations
  };
}
