-- Tabela para tracking de migrations executadas
-- Esta é uma migration especial que sempre é executada primeiro

CREATE TABLE IF NOT EXISTS migration_history (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64) NOT NULL,
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'success'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_migration_history_filename ON migration_history(filename);
CREATE INDEX IF NOT EXISTS idx_migration_history_executed_at ON migration_history(executed_at);

-- Inserir registro inicial do sistema de tracking
INSERT INTO migration_history (filename, checksum, execution_time_ms, status)
VALUES ('000_migration_tracking.sql', 'initial', 0, 'success')
ON CONFLICT (filename) DO NOTHING;