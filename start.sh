#!/bin/bash

# Script de inicialização para WPPConnect Server no Dokploy

echo "🚀 Iniciando WPPConnect Server no Dokploy..."

# Definir variáveis padrão se não estiverem definidas
export NODE_ENV=${NODE_ENV:-production}
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=${PUPPETEER_SKIP_CHROMIUM_DOWNLOAD:-true}

# Tentar encontrar o executável do Chromium
if [ -z "$PUPPETEER_EXECUTABLE_PATH" ]; then
    echo "🔍 Procurando por Chromium..."
    
    # Primeiro, tentar usar o comando 'which' para chromium
    if command -v chromium >/dev/null 2>&1; then
        export PUPPETEER_EXECUTABLE_PATH="chromium"
        echo "✅ Chromium encontrado via PATH: chromium"
    elif command -v chromium-browser >/dev/null 2>&1; then
        export PUPPETEER_EXECUTABLE_PATH="chromium-browser"
        echo "✅ Chromium encontrado via PATH: chromium-browser"
    else
        # Procurar por chromium em locais comuns
        for path in /usr/bin/chromium-browser /usr/bin/chromium /usr/bin/google-chrome-stable /usr/bin/google-chrome; do
            if [ -x "$path" ]; then
                export PUPPETEER_EXECUTABLE_PATH="$path"
                echo "✅ Chromium encontrado em: $path"
                break
            fi
        done
        
        # Se não encontrar, tentar no Nix store (método mais específico)
        if [ -z "$PUPPETEER_EXECUTABLE_PATH" ]; then
            # Procurar especificamente pelo executável chromium no Nix store
            NIX_CHROMIUM=$(find /nix/store -path "*/bin/chromium" -type f -executable 2>/dev/null | head -1)
            if [ -n "$NIX_CHROMIUM" ]; then
                export PUPPETEER_EXECUTABLE_PATH="$NIX_CHROMIUM"
                echo "✅ Chromium encontrado no Nix store: $NIX_CHROMIUM"
            else
                # Fallback: procurar qualquer executável com nome chromium
                NIX_CHROMIUM=$(find /nix/store -name "*chromium*" -type f -executable 2>/dev/null | grep -E "(chromium|chrome)$" | head -1)
                if [ -n "$NIX_CHROMIUM" ]; then
                    export PUPPETEER_EXECUTABLE_PATH="$NIX_CHROMIUM"
                    echo "✅ Chromium encontrado no Nix (fallback): $NIX_CHROMIUM"
                fi
            fi
        fi
    fi
fi

# Verificar se o Chromium foi encontrado
if [ -z "$PUPPETEER_EXECUTABLE_PATH" ]; then
    echo "⚠️  AVISO: Chromium não encontrado. Puppeteer pode falhar."
    echo "   Definindo caminho padrão: /usr/bin/chromium-browser"
    export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
else
    echo "✅ Usando Chromium: $PUPPETEER_EXECUTABLE_PATH"
fi

# Verificar se o executável do Chromium existe e é executável
if [ ! -x "$PUPPETEER_EXECUTABLE_PATH" ]; then
    echo "❌ ERRO: Chromium não é executável: $PUPPETEER_EXECUTABLE_PATH"
    echo "   Tentando usar chromium padrão do sistema..."
    export PUPPETEER_EXECUTABLE_PATH="chromium-browser"
fi

# Criar diretório de dados do usuário se não existir
mkdir -p ./userDataDir

# Mostrar configurações importantes
echo "🔧 Configurações:"
echo "   - NODE_ENV: $NODE_ENV"
echo "   - PORT: ${PORT:-21465}"
echo "   - PUPPETEER_EXECUTABLE_PATH: $PUPPETEER_EXECUTABLE_PATH"
echo "   - START_ALL_SESSIONS: ${START_ALL_SESSIONS:-false}"

# Iniciar o servidor
echo "🎯 Iniciando servidor..."
exec node ./dist/server.js