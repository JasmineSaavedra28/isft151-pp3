#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PATH="$SCRIPT_DIR/backend"

echo "Iniciando Node.js desde $BACKEND_PATH"
cd "$BACKEND_PATH" || { echo "No existe $BACKEND_PATH"; exit 1; }

if [ -s "$HOME/.nvm/nvm.sh" ]; then
    . "$HOME/.nvm/nvm.sh"

    if ! nvm use 22 >/dev/null 2>&1; then
        nvm install 22 || exit 1
        nvm use 22 || exit 1
    fi
else
    echo "Aviso: NVM no está instalado en $HOME/.nvm"
fi

VERSION_ACTUAL=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$VERSION_ACTUAL" -lt 22 ]; then
    echo "======================================================================"
    echo "❌ ERROR DE ARQUITECTURA DE ENTORNO"
    echo "Este backend requiere Node.js v22 o superior para usar 'node:sqlite'."
    echo "Tu versión actual en esta terminal es: $(node -v)"
    echo "======================================================================"
    read -p "Presioná Enter para salir..."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 No se encontró la carpeta node_modules."
    echo "Instalando dependencias declaradas en el package.json automáticamente..."
    npm install
fi

node main.mjs
