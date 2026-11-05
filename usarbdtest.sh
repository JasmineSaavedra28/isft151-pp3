#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PATH="$SCRIPT_DIR/backend"

echo "Iniciando backend con la base de prueba..."
cd "$BACKEND_PATH" || { echo "No existe $BACKEND_PATH"; exit 1; }

if [ -s "$HOME/.nvm/nvm.sh" ]; then
    . "$HOME/.nvm/nvm.sh"
    if ! nvm use 22 >/dev/null 2>&1; then
        nvm install 22 || exit 1
        nvm use 22 || exit 1
    fi
fi

VERSION_ACTUAL=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$VERSION_ACTUAL" -lt 22 ]; then
    echo "Se requiere Node.js 22 o superior. Versión detectada: $(node -v)"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del backend..."
    npm install || exit 1
fi

export DB_PATH="./db-test.sqlite3"
echo "Base de prueba: $DB_PATH"
echo "Backend en http://localhost:3000"
node main.mjs
