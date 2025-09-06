#!/bin/bash

# Script para executar T-013 Integration Testing
# Executa todos os testes de integração da biblioteca de campanhas

set -e  # Exit on any error

echo "🚀 Iniciando T-013 Integration Testing - Biblioteca de Campanhas Pet"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "../package.json" ]; then
    print_error "Deve ser executado do diretório tests/"
    exit 1
fi

# Create results directory
mkdir -p results
mkdir -p reports

print_status "Verificando dependências do projeto principal..."

# Check if main project dependencies are installed
cd ..
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependências do projeto principal..."
    npm install
fi

# Start the development server in background
print_status "Iniciando servidor de desenvolvimento..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
print_status "Aguardando servidor inicializar..."
sleep 10

# Function to cleanup on exit
cleanup() {
    print_status "Limpando processos..."
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

# Go back to tests directory
cd tests

print_status "Instalando dependências de teste..."

# Install test dependencies if not already installed
if [ ! -d "node_modules" ]; then
    npm install
fi

# Install Playwright browsers
print_status "Instalando navegadores do Playwright..."
npx playwright install

print_status "Executando testes de integração..."

# Run integration tests
echo ""
echo "📋 1. TESTES DE INTEGRAÇÃO FUNCIONAIS"
echo "======================================"

npm run test:integration 2>&1 | tee results/integration-tests.log
INTEGRATION_EXIT_CODE=${PIPESTATUS[0]}

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    print_success "Testes de integração funcionais passaram"
else
    print_error "Testes de integração funcionais falharam"
fi

echo ""
echo "🌐 2. TESTES DE COMPATIBILIDADE ENTRE NAVEGADORES"
echo "================================================="

npm run test:browser 2>&1 | tee results/browser-tests.log
BROWSER_EXIT_CODE=${PIPESTATUS[0]}

if [ $BROWSER_EXIT_CODE -eq 0 ]; then
    print_success "Testes de compatibilidade entre navegadores passaram"
else
    print_error "Testes de compatibilidade entre navegadores falharam"
fi

echo ""
echo "♿ 3. TESTES DE ACESSIBILIDADE"
echo "============================="

npm run test:accessibility 2>&1 | tee results/accessibility-tests.log
ACCESSIBILITY_EXIT_CODE=${PIPESTATUS[0]}

if [ $ACCESSIBILITY_EXIT_CODE -eq 0 ]; then
    print_success "Testes de acessibilidade passaram"
else
    print_error "Testes de acessibilidade falharam"
fi

echo ""
echo "⚡ 4. TESTES DE PERFORMANCE"
echo "=========================="

npm run test:performance 2>&1 | tee results/performance-tests.log
PERFORMANCE_EXIT_CODE=${PIPESTATUS[0]}

if [ $PERFORMANCE_EXIT_CODE -eq 0 ]; then
    print_success "Testes de performance passaram"
else
    print_error "Testes de performance falharam"
fi

echo ""
echo "📊 5. GERANDO RELATÓRIO DE COBERTURA"
echo "===================================="

npm run test:coverage 2>&1 | tee results/coverage-report.log
COVERAGE_EXIT_CODE=${PIPESTATUS[0]}

if [ $COVERAGE_EXIT_CODE -eq 0 ]; then
    print_success "Relatório de cobertura gerado"
else
    print_warning "Falha ao gerar relatório de cobertura"
fi

# Generate summary report
echo ""
echo "📋 RESUMO DOS RESULTADOS"
echo "======================="

TOTAL_TESTS=0
PASSED_TESTS=0

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    print_success "✅ Testes de Integração Funcionais"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "❌ Testes de Integração Funcionais"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ $BROWSER_EXIT_CODE -eq 0 ]; then
    print_success "✅ Compatibilidade entre Navegadores"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "❌ Compatibilidade entre Navegadores"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ $ACCESSIBILITY_EXIT_CODE -eq 0 ]; then
    print_success "✅ Testes de Acessibilidade WCAG 2.1 AA"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "❌ Testes de Acessibilidade WCAG 2.1 AA"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ $PERFORMANCE_EXIT_CODE -eq 0 ]; then
    print_success "✅ Testes de Performance e Carga"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "❌ Testes de Performance e Carga"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "🎯 RESULTADO FINAL: $PASSED_TESTS/$TOTAL_TESTS suítes de teste passaram"

# Generate JSON report
cat > results/test-summary.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_suites": $TOTAL_TESTS,
  "passed_suites": $PASSED_TESTS,
  "success_rate": $(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc),
  "results": {
    "integration_tests": $([ $INTEGRATION_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),
    "browser_compatibility": $([ $BROWSER_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),
    "accessibility_compliance": $([ $ACCESSIBILITY_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),
    "performance_tests": $([ $PERFORMANCE_EXIT_CODE -eq 0 ] && echo "true" || echo "false")
  },
  "exit_codes": {
    "integration": $INTEGRATION_EXIT_CODE,
    "browser": $BROWSER_EXIT_CODE,
    "accessibility": $ACCESSIBILITY_EXIT_CODE,
    "performance": $PERFORMANCE_EXIT_CODE
  }
}
EOF

print_status "Relatório salvo em results/test-summary.json"
print_status "Logs detalhados disponíveis em results/"

# Exit with error if any critical test failed
if [ $INTEGRATION_EXIT_CODE -ne 0 ] || [ $BROWSER_EXIT_CODE -ne 0 ]; then
    print_error "Testes críticos falharam. Verifique os logs para detalhes."
    exit 1
fi

if [ $ACCESSIBILITY_EXIT_CODE -ne 0 ]; then
    print_warning "Testes de acessibilidade falharam. Verificar conformidade WCAG."
fi

if [ $PERFORMANCE_EXIT_CODE -ne 0 ]; then
    print_warning "Testes de performance falharam. Verificar otimizações necessárias."
fi

echo ""
print_success "T-013 Integration Testing concluído!"
print_status "Próximo passo: T-014 Performance Optimization"

exit 0