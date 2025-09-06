/**
 * Query Optimization Service
 * 
 * Otimiza queries do banco de dados baseadas em análise de performance
 */

import { db } from '../db';

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
    // Conexão com o banco de dados principal
    this.db = db;
  }

  /**
   * Analisa uma query para identificar gargalos de performance
   * @param query A query SQL a ser analisada
   * @returns Análise detalhada da performance da query
   */
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    const startTime = performance.now();
    
    // Simula a execução da query com EXPLAIN
    // Para PostgreSQL, usamos EXPLAIN (ANALYZE, BUFFERS) em vez de EXPLAIN QUERY PLAN
    try {
      const plan = await this.db.execute(`EXPLAIN (ANALYZE, BUFFERS) ${query}`);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      const recommendations = this.generateRecommendations(plan.rows);
      
      return {
        query,
        executionTime,
        plan: plan.rows,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing query:', error);
      return {
        query,
        executionTime: 0,
        plan: [],
        recommendations: ['Query analysis failed. Please check syntax.']
      };
    }
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
    
    if (!plan || plan.length === 0) {
      return ['No plan information available'];
    }
    
    plan.forEach(step => {
      const planText = step['QUERY PLAN'] || step.toString();
      
      if (planText.includes('Seq Scan')) {
        recommendations.push('Query is using sequential scan. Consider adding an index to improve performance.');
      }
      
      if (planText.includes('Sort')) {
        recommendations.push('Query requires sorting. Consider adding an index on the ORDER BY columns.');
      }
      
      if (planText.includes('Hash Join')) {
        recommendations.push('Query uses hash join. Consider if the join conditions can be optimized.');
      }
      
      if (planText.includes('Nested Loop')) {
        recommendations.push('Query uses nested loop join. Consider adding indexes to join columns.');
      }
    });
    
    if (plan.length > 5) {
      recommendations.push('Query has many execution steps. Consider simplifying JOINs or subqueries.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Query appears to be well optimized.');
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
    try {
      const result = await this.db.execute(`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = $1
      `, [tableName]);
      return result.rows;
    } catch (error) {
      console.error('Error listing indexes:', error);
      return [];
    }
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
      await this.db.execute(query);
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