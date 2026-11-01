# ==========================================
# Estágio 1: Build da Aplicação Angular
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia arquivos de definição de dependências
COPY package.json package-lock.json ./

# Instalação limpa e determinística das dependências
RUN npm ci

# Copia todo o código-fonte da aplicação
COPY . .

# Garante a existência do arquivo de configuração inicial se não montado
RUN if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env; fi

# Compilação da aplicação para produção (dispara prebuild com scripts/sync-env.mjs)
RUN npm run build -- --configuration production

# ==========================================
# Estágio 2: Servidor Nginx de Produção
# ==========================================
FROM nginx:alpine

# Remove os arquivos padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Configuração customizada do Nginx para Angular SPA e Cache
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html index.htm;\n\
\n\
    # Cabeçalhos de segurança HTTP\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    add_header X-XSS-Protection "1; mode=block" always;\n\
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\
\n\
    # Compressão Gzip para otimização de largura de banda\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_min_length 1024;\n\
    gzip_proxied expired no-cache no-store private auth;\n\
    gzip_types\n\
        text/plain\n\
        text/css\n\
        text/javascript\n\
        application/javascript\n\
        application/json\n\
        application/x-javascript\n\
        image/svg+xml;\n\
\n\
    # Roteamento SPA do Angular (HTML5 PathLocationStrategy)\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Proxy reverso para API Backend na rede de containers\n\
    location /api/ {\n\
        proxy_pass http://backend:8080/api/;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade $http_upgrade;\n\
        proxy_set_header Connection "upgrade";\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_cache_bypass $http_upgrade;\n\
    }\n\
\n\
    # Cache estático de 1 ano para bundles versionados\n\
    location ~* \\.(?:css|js|woff2?|eot|ttf|otf|ico|png|jpg|jpeg|gif|svg|webp)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, max-age=31536000, immutable";\n\
        access_log off;\n\
    }\n\
\n\
    # Desativa cache para index.html garantindo atualização instantânea de novas versões\n\
    location = /index.html {\n\
        expires -1;\n\
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";\n\
    }\n\
\n\
    # Tratamento de erros HTTP\n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
        root /usr/share/nginx/html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Copia os artefatos compilados do estágio de build para o diretório servido pelo Nginx
COPY --from=builder /app/dist/Financial-Manager-Interface/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
