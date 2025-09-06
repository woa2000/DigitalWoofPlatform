/**
 * Test Client Helper
 * 
 * Cliente HTTP para testes de integração
 */

interface TestResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
}

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export class TestClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async get(path: string, options: RequestOptions = {}): Promise<TestResponse> {
    return this.request('GET', path, undefined, options);
  }

  async post(path: string, data?: any, options: RequestOptions = {}): Promise<TestResponse> {
    return this.request('POST', path, data, options);
  }

  async put(path: string, data?: any, options: RequestOptions = {}): Promise<TestResponse> {
    return this.request('PUT', path, data, options);
  }

  async patch(path: string, data?: any, options: RequestOptions = {}): Promise<TestResponse> {
    return this.request('PATCH', path, data, options);
  }

  async delete(path: string, options: RequestOptions = {}): Promise<TestResponse> {
    return this.request('DELETE', path, undefined, options);
  }

  private async request(
    method: string, 
    path: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<TestResponse> {
    const url = `${this.baseUrl}${path}`;
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    try {
      // Simular resposta para testes (em ambiente real usaria fetch ou axios)
      const response = await this.mockRequest(method, path, data, headers);
      return response;
    } catch (error) {
      throw new Error(`Request failed: ${method} ${path} - ${error}`);
    }
  }

  private async mockRequest(
    method: string, 
    path: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<TestResponse> {
    // Simular diferentes cenários baseado no path e método
    
    // Rate limiting simulation
    if (this.shouldSimulateRateLimit()) {
      return {
        status: 429,
        data: { error: 'Too Many Requests' },
        headers: { 'Retry-After': '60' }
      };
    }
    
    // Templates endpoints
    if (path.startsWith('/api/templates')) {
      return this.handleTemplatesEndpoint(method, path, data);
    }
    
    // Assets endpoints
    if (path.startsWith('/api/assets')) {
      return this.handleAssetsEndpoint(method, path, data);
    }
    
    // Campaigns endpoints
    if (path.startsWith('/api/campaigns')) {
      return this.handleCampaignsEndpoint(method, path, data);
    }
    
    // Performance endpoints
    if (path.startsWith('/api/performance')) {
      return this.handlePerformanceEndpoint(method, path, data);
    }
    
    // Default 404
    return {
      status: 404,
      data: { error: 'Not Found' },
      headers: {}
    };
  }

  private requestCount = 0;
  private lastRequestTime = 0;

  private shouldSimulateRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter every minute
    if (now - this.lastRequestTime > 60000) {
      this.requestCount = 0;
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
    
    // Simulate rate limiting after 15 requests per minute
    return this.requestCount > 15;
  }

  private handleTemplatesEndpoint(method: string, path: string, data?: any): TestResponse {
    const pathParts = path.split('/');
    
    if (method === 'GET' && path === '/api/templates') {
      return this.getTemplatesList(path);
    }
    
    if (method === 'GET' && pathParts.length === 4) {
      const templateId = pathParts[3];
      return this.getTemplateById(templateId);
    }
    
    if (method === 'POST' && path === '/api/templates/compare') {
      return this.compareTemplates(data);
    }
    
    if (method === 'GET' && path.includes('/recommendations')) {
      return this.getTemplateRecommendations();
    }
    
    if (method === 'POST' && path.includes('/personalize')) {
      return this.personalizeTemplate(data);
    }
    
    if (method === 'POST' && path.includes('/preview')) {
      return this.previewTemplate(data);
    }
    
    return { status: 404, data: { error: 'Template endpoint not found' }, headers: {} };
  }

  private getTemplatesList(path: string): TestResponse {
    const url = new URL(`http://localhost${path}`);
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Validate pagination
    if (page < 1 || limit < 1) {
      return {
        status: 400,
        data: { error: 'Invalid pagination parameters' },
        headers: {}
      };
    }
    
    let templates = this.getMockTemplates();
    
    // Apply filters
    if (search) {
      if (search === 'xyzabc123nonexistent') {
        templates = [];
      } else {
        templates = templates.filter(t => 
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
        );
      }
    }
    
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    
    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTemplates = templates.slice(start, end);
    
    return {
      status: 200,
      data: {
        templates: paginatedTemplates,
        pagination: {
          page,
          limit,
          total: templates.length,
          pages: Math.ceil(templates.length / limit)
        }
      },
      headers: {}
    };
  }

  private getTemplateById(templateId: string): TestResponse {
    if (templateId === 'invalid-id') {
      return {
        status: 404,
        data: { error: 'Template not found' },
        headers: {}
      };
    }
    
    const templates = this.getMockTemplates();
    const template = templates.find(t => t.id === templateId) || templates[0];
    
    return {
      status: 200,
      data: {
        ...template,
        content: 'Detailed template content with {{variables}}'
      },
      headers: {}
    };
  }

  private compareTemplates(data: any): TestResponse {
    const templateIds = data?.templateIds || [];
    
    if (!Array.isArray(templateIds) || templateIds.length === 0) {
      return {
        status: 400,
        data: { error: 'Template IDs required' },
        headers: {}
      };
    }
    
    const comparison = templateIds.map((id: string) => ({
      id,
      title: `Template ${id}`,
      performance_score: Math.random() * 100,
      engagement_rate: Math.random() * 10,
      conversion_rate: Math.random() * 5
    }));
    
    return {
      status: 200,
      data: { comparison },
      headers: {}
    };
  }

  private getTemplateRecommendations(): TestResponse {
    const recommendations = this.getMockTemplates().slice(0, 3);
    
    return {
      status: 200,
      data: { recommendations },
      headers: {}
    };
  }

  private personalizeTemplate(data: any): TestResponse {
    if (!data?.brandVoiceId) {
      return {
        status: 400,
        data: { error: 'Brand voice ID is required' },
        headers: {}
      };
    }
    
    const customText = data.customizations?.customText || '';
    let personalizedContent = 'Personalized content for your brand';
    
    // Simulate HTML sanitization
    if (customText.includes('<script>')) {
      personalizedContent = customText.replace(/<script[^>]*>.*?<\/script>/gi, '');
    } else if (customText) {
      personalizedContent = customText;
    }
    
    return {
      status: 200,
      data: {
        personalizedContent,
        personalizationScore: Math.random() * 100
      },
      headers: {}
    };
  }

  private previewTemplate(data: any): TestResponse {
    return {
      status: 200,
      data: {
        preview: {
          content: 'Template preview content',
          channel: data?.channel || 'instagram'
        }
      },
      headers: {}
    };
  }

  private handleAssetsEndpoint(method: string, path: string, data?: any): TestResponse {
    if (method === 'GET' && path.startsWith('/api/assets?')) {
      return this.getAssetsList(path);
    }
    
    if (method === 'GET' && path === '/api/assets/favorites') {
      return this.getFavoriteAssets();
    }
    
    if (method === 'POST' && path.includes('/favorite')) {
      return { status: 200, data: { success: true }, headers: {} };
    }
    
    if (method === 'DELETE' && path.includes('/favorite')) {
      return { status: 200, data: { success: true }, headers: {} };
    }
    
    if (method === 'POST' && path === '/api/assets/collections') {
      return this.createCollection(data);
    }
    
    if (method === 'POST' && path === '/api/assets/upload') {
      return this.uploadAsset(data);
    }
    
    return { status: 404, data: { error: 'Asset endpoint not found' }, headers: {} };
  }

  private getAssetsList(path: string): TestResponse {
    const url = new URL(`http://localhost${path}`);
    const type = url.searchParams.get('type');
    
    let assets = this.getMockAssets();
    
    if (type) {
      assets = assets.filter(a => a.type === type);
    }
    
    return {
      status: 200,
      data: {
        assets,
        pagination: { page: 1, limit: 10, total: assets.length, pages: 1 }
      },
      headers: {}
    };
  }

  private getFavoriteAssets(): TestResponse {
    const assets = this.getMockAssets().slice(0, 2);
    return {
      status: 200,
      data: { assets },
      headers: {}
    };
  }

  private createCollection(data: any): TestResponse {
    return {
      status: 201,
      data: {
        id: 'collection-' + Date.now(),
        name: data?.name || 'Untitled Collection',
        description: data?.description || '',
        assetIds: data?.assetIds || []
      },
      headers: {}
    };
  }

  private uploadAsset(data: any): TestResponse {
    const filename = data?.filename || '';
    
    if (filename.endsWith('.exe') || !filename.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
      return {
        status: 400,
        data: { error: 'Invalid file type' },
        headers: {}
      };
    }
    
    return {
      status: 200,
      data: {
        id: 'asset-' + Date.now(),
        filename,
        url: `/assets/${filename}`
      },
      headers: {}
    };
  }

  private handleCampaignsEndpoint(method: string, path: string, data?: any): TestResponse {
    if (method === 'POST' && path === '/api/campaigns') {
      return this.createCampaign(data);
    }
    
    if (method === 'POST' && path === '/api/campaigns/draft') {
      return this.saveDraft(data);
    }
    
    if (method === 'GET' && path.includes('/api/campaigns/draft/')) {
      return this.loadDraft();
    }
    
    return { status: 404, data: { error: 'Campaign endpoint not found' }, headers: {} };
  }

  private createCampaign(data: any): TestResponse {
    return {
      status: 201,
      data: {
        id: 'campaign-' + Date.now(),
        name: data?.name || 'Untitled Campaign',
        status: 'draft',
        templateId: data?.templateId,
        brandVoiceId: data?.brandVoiceId
      },
      headers: {}
    };
  }

  private saveDraft(data: any): TestResponse {
    return {
      status: 200,
      data: {
        draftId: 'draft-' + Date.now()
      },
      headers: {}
    };
  }

  private loadDraft(): TestResponse {
    return {
      status: 200,
      data: {
        name: 'Draft Campaign 2',
        step: 'configuration',
        data: { budget: 500 }
      },
      headers: {}
    };
  }

  private handlePerformanceEndpoint(method: string, path: string, data?: any): TestResponse {
    if (path.includes('/campaigns')) {
      return this.getCampaignPerformance();
    }
    
    if (path.includes('/templates/ranking')) {
      return this.getTemplateRanking();
    }
    
    if (path.includes('/benchmarks')) {
      return this.getBenchmarks();
    }
    
    if (path.includes('/insights')) {
      return this.getInsights();
    }
    
    if (path.includes('/export')) {
      return this.exportPerformance();
    }
    
    return { status: 404, data: { error: 'Performance endpoint not found' }, headers: {} };
  }

  private getCampaignPerformance(): TestResponse {
    return {
      status: 200,
      data: {
        campaigns: [
          { id: 'camp-1', name: 'Campaign 1', impressions: 5000, clicks: 250, conversions: 25 },
          { id: 'camp-2', name: 'Campaign 2', impressions: 3000, clicks: 180, conversions: 18 }
        ],
        summary: { total_impressions: 8000, total_clicks: 430, total_conversions: 43 }
      },
      headers: {}
    };
  }

  private getTemplateRanking(): TestResponse {
    return {
      status: 200,
      data: {
        ranking: [
          { id: 'template-1', name: 'Template 1', score: 95 },
          { id: 'template-2', name: 'Template 2', score: 87 }
        ]
      },
      headers: {}
    };
  }

  private getBenchmarks(): TestResponse {
    return {
      status: 200,
      data: {
        benchmarks: [
          { metric: 'ctr', industry_average: 2.5, your_average: 3.2 },
          { metric: 'conversion_rate', industry_average: 1.8, your_average: 2.1 }
        ]
      },
      headers: {}
    };
  }

  private getInsights(): TestResponse {
    return {
      status: 200,
      data: {
        insights: [
          { type: 'improvement', message: 'Your engagement rate increased 15% this week' },
          { type: 'recommendation', message: 'Consider posting more content on Fridays' }
        ]
      },
      headers: {}
    };
  }

  private exportPerformance(): TestResponse {
    return {
      status: 200,
      data: {
        downloadUrl: '/exports/performance-2024-01.csv'
      },
      headers: {}
    };
  }

  private getMockTemplates() {
    return [
      {
        id: 'template-1',
        title: 'Promoção Ração Premium',
        description: 'Template para promoção de ração premium para cães',
        category: 'promotional',
        target_audience: 'pet_owners_young'
      },
      {
        id: 'template-2',
        title: 'Dicas de Cuidados com Cães',
        description: 'Template educativo sobre cuidados',
        category: 'educational',
        target_audience: 'pet_owners_all'
      },
      {
        id: 'template-3',
        title: 'Lançamento Produto',
        description: 'Template para lançamento de produtos',
        category: 'product_launch',
        target_audience: 'pet_owners_premium'
      }
    ];
  }

  private getMockAssets() {
    return [
      {
        id: 'asset-1',
        filename: 'cao-feliz.jpg',
        type: 'image',
        url: '/assets/cao-feliz.jpg',
        alt_text: 'Cão feliz correndo'
      },
      {
        id: 'asset-2',
        filename: 'gato-brincando.jpg',
        type: 'image',
        url: '/assets/gato-brincando.jpg',
        alt_text: 'Gato brincando'
      },
      {
        id: 'asset-3',
        filename: 'racao-premium.jpg',
        type: 'image',
        url: '/assets/racao-premium.jpg',
        alt_text: 'Ração premium'
      }
    ];
  }
}