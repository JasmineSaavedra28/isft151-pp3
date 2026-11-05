#!/bin/bash

sudo systemctl stop apache2

if [ -d "$(pwd)/frontend" ]; then
    FRONTEND_PATH="$(pwd)/frontend"
else
    FRONTEND_PATH="$(pwd)"
fi

CONFIG_TEMPORAL="/tmp/apache_sdk_v4.conf"

echo "Generando configuración temporal para Apache..."

cat << EOF > $CONFIG_TEMPORAL
Include /etc/apache2/apache2.conf

ServerName localhost

Listen 8081

<VirtualHost *:8081>
    DocumentRoot "$FRONTEND_PATH"
    
    <Directory "$FRONTEND_PATH">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF

echo "Iniciando Apache en http://localhost:8081..."
echo "Sirviendo desde el directorio: $FRONTEND_PATH"

sudo apachectl -D FOREGROUND -f $CONFIG_TEMPORAL