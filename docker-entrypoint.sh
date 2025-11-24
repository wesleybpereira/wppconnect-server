#!/bin/bash
set -e

# ==============================================================================
# WPPConnect Server - Docker Entrypoint
# ==============================================================================
# Este script garante:
# 1. Limpeza de locks do Chrome antes de iniciar
# 2. Graceful shutdown em caso de SIGTERM (redeploy/stop)
# 3. Logs claros de inicialização
# ==============================================================================

echo "[ENTRYPOINT] Starting WPPConnect Server..."
echo "[ENTRYPOINT] Version: $(cat package.json | grep '\"version\"' | head -1 | cut -d'"' -f4)"

# Função para limpeza de locks do Chrome
cleanup_chrome_locks() {
    echo "[ENTRYPOINT] Cleaning Chrome locks..."
    
    USER_DATA_DIR="${CUSTOM_USER_DATA_DIR:-./userDataDir}"
    
    if [ -d "$USER_DATA_DIR" ]; then
        # Remove todos os locks de todas as sessões
        find "$USER_DATA_DIR" -type l -name "Singleton*" -delete 2>/dev/null || true
        find "$USER_DATA_DIR" -type f -name "Singleton*" -delete 2>/dev/null || true
        find "$USER_DATA_DIR" -type f -name "lockfile" -delete 2>/dev/null || true
        
        echo "[ENTRYPOINT] Chrome locks cleaned in: $USER_DATA_DIR"
    else
        echo "[ENTRYPOINT] User data dir not found: $USER_DATA_DIR (will be created)"
    fi
}

# Função para graceful shutdown
graceful_shutdown() {
    echo "[ENTRYPOINT] Received SIGTERM/SIGINT - graceful shutdown initiated..."
    
    # Mata processos Chrome
    pkill -TERM chrome 2>/dev/null || true
    pkill -TERM chromium 2>/dev/null || true
    
    # Aguarda 5 segundos
    sleep 5
    
    # Força kill se necessário
    pkill -9 chrome 2>/dev/null || true
    pkill -9 chromium 2>/dev/null || true
    
    # Limpa locks antes de sair
    cleanup_chrome_locks
    
    echo "[ENTRYPOINT] Shutdown complete"
    exit 0
}

# Registra handlers de sinais
trap graceful_shutdown SIGTERM SIGINT

# Limpa locks antes de iniciar
cleanup_chrome_locks

# Inicia servidor Node.js
echo "[ENTRYPOINT] Starting Node.js server..."
exec node dist/server.js &

# Captura PID do Node
NODE_PID=$!

# Aguarda pelo processo Node
wait $NODE_PID
