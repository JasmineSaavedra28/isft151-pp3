#!/bin/bash

DIR_ACTUAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Iniciando entorno de prueba..."
echo "Ubicación: $DIR_ACTUAL"

if command -v xfce4-terminal &> /dev/null; then
    TERMINAL="xfce4-terminal"
    $TERMINAL --title="Node Backend - Prueba" --command="bash -c 'cd \"$DIR_ACTUAL\"; ./usarbdtest.sh; exec bash'" &
    $TERMINAL --title="Apache Frontend - Prueba" --command="bash -c 'cd \"$DIR_ACTUAL\"; ./levantar_apache.sh; exec bash'" &
else
    TERMINAL="x-terminal-emulator"
    $TERMINAL -e "bash -c 'cd \"$DIR_ACTUAL\"; ./usarbdtest.sh; exec bash'" &
    $TERMINAL -e "bash -c 'cd \"$DIR_ACTUAL\"; ./levantar_apache.sh; exec bash'" &
fi

echo "¡Terminales de prueba lanzadas en segundo plano!"
