/**
 * Query Optimization Service
 * 
 * Otimiza queries do banco de dados baseadas em análise de performance
 */

import { getTestDatabase } from '../../tests/helpers/database'; // Usando para simulação

interface QueryAnalysis {
  query: string;
  executionTime: number;
  plan: any;
  recommendations: string[];
}

interface OptimizationResult {
  originalQuery: string;
  optimizedQuery: string;
  performanceGain: number; // Percentage
}

export class QueryOptimizer {
  private db: any;

  constructor() {
    // Em um ambiente real, conectaríamos ao banco de dados principal
    this.db = getTestDatabase();
  }

  /**
   * Analisa uma query para identificar gargalos de performance
   * @param query A query SQL a ser analisada
   * @returns Análise detalhada da performance da query
   */
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    const startTime = performance.now();
    
    // Simula a execução da query com EXPLAIN
    const plan = this.db.prepare(`EXPLAIN QUERY PLAN ${query}`).all();
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    const recommendations = this.generateRecommendations(plan);
    
    return {
      query,
      executionTime,
      plan,
      recommendations
    };
  }

  /**
   * Otimiza uma query baseada na análise de performance
   * @param query A query SQL a ser otimizada
   * @returns Query otimizada e ganho de performance
   */
  async optimizeQuery(query: string): Promise<OptimizationResult> {
    const analysis = await this.analyzeQuery(query);
    
    let optimizedQuery = query;
    
    // Aplica otimizações baseadas nas recomendações
    if (analysis.recommendations.some(rec => rec.includes('index'))) {
      // Simula a criação de um índice e reescreve a query se necessário
      optimizedQuery = this.applyIndexOptimizations(query);
    }
    
    if (analysis.recommendations.some(rec => rec.includes('JOIN'))) {
      optimizedQuery = this.applyJoinOptimizations(query);
    }
    
    // Mede a performance da query otimizada
    const optimizedAnalysis = await this.analyzeQuery(optimizedQuery);
    
    const performanceGain = ((analysis.executionTime - optimizedAnalysis.executionTime) / analysis.executionTime) * 100;
    
    return {
      originalQuery: query,
      optimizedQuery,
      performanceGain: Math.max(0, performanceGain) // Garante que não seja negativo
    };
  }

  /**
   * Gera recomendações baseadas no plano de execução da query
   * @param plan O plano de execução da query
   * @returns Lista de recomendações de otimização
   */
  private generateRecommendations(plan: any[]): string[] {
    const recommendations: string[] = [];
    
    plan.forEach(step => {
      if (step.detail.includes('SCAN TABLE')) {
        const tableName = step.detail.split(' ')[2];
        recommendations.push(`Consider adding an index to table '${tableName}' to avoid a full table scan.`);
      }
      
      if (step.detail.includes('USING TEMP B-TREE')) {
        recommendations.push('Query is using a temporary B-TREE for sorting or grouping. Consider adding an index to the relevant columns.');
      }
      
      if (step.detail.includes('SEARCH TABLE') && step.detail.includes('USING COVERING INDEX')) {
        // This is good, but we can check for other things
      }
    });
    
    if (plan.length > 3) {
      recommendations.push('Query has multiple steps. Consider simplifying JOINs or subqueries.');
    }
    
    return recommendations;
  }

  /**
   * Simula a aplicação de otimizações de índice
   * @param query A query original
   * @returns A query potencialmente modificada
   */
  private applyIndexOptimizations(query: string): string {
    // Em um cenário real, criaríamos o índice no banco
    // Aqui, apenas retornamos a query como está, pois a otimização é no schema
    console.log('Optimization: Recommended index creation.');
    return query;
  }

  /**
   * Simula a aplicação de otimizações de JOIN
   * @param query A query original
   * @returns A query potencialmente modificada
   */
  private applyJoinOptimizations(query: string): string {
    let optimizedQuery = query;
    
    // Exemplo: Trocar LEFT JOIN por INNER JOIN se possível
    if (query.toLowerCase().includes('left join') && !query.toLowerCase().includes('where') && query.toLowerCase().includes('is null')) {
      optimizedQuery = query.replace(/left join/gi, 'INNER JOIN');
      console.log('Optimization: Replaced LEFT JOIN with INNER JOIN.');
    }
    
    return optimizedQuery;
  }

  /**
   * Lista os índices existentes em uma tabela
   * @param tableName O nome da tabela
   * @returns Lista de índices
   */
  async listIndexes(tableName: string): Promise<any[]> {
    return this.db.prepare(`PRAGMA index_list(${tableName})`).all();
  }

  /**
   * Cria um novo índice (simulação)
   * @param tableName O nome da tabela
   * @param columnName O nome da coluna para indexar
   */
  async createIndex(tableName: string, columnName: string): Promise<void> {
    const indexName = `idx_${tableName}_${columnName}`;
    const query = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${columnName})`;
    
    try {
      this.db.exec(query);
      console.log(`Index '${indexName}' created successfully on '${tableName}'.`);
    } catch (error) {
      console.error(`Failed to create index '${indexName}':`, error);
    }
  }
}

/**
 * Middleware para análise de queries em tempo real (simulação)
 */
export function queryAnalysisMiddleware(optimizer: QueryOptimizer) {
  return async (req: any, res: any, next: any) => {
    if (req.body && req.body.query) {
      const analysis = await optimizer.analyzeQuery(req.body.query);
      
      // Adiciona análise ao header da resposta para debug
      res.set('X-Query-Analysis', JSON.stringify({
        executionTime: analysis.executionTime,
        recommendations: analysis.recommendations
      }));
    }
    next();
  };
}