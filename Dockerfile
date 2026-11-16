# ---------------------------------------------------------
# ESTÁGIO 1: Build (Node.js 20 Alpine)
# ---------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund --quiet

COPY . .

# Por padrão a API é acessada no mesmo site, pelo proxy /api do nginx.
ARG VITE_API_URL=/api
ARG VITE_NOMINATIM_EMAIL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_NOMINATIM_EMAIL=$VITE_NOMINATIM_EMAIL

RUN npm run build

# ---------------------------------------------------------
# ESTÁGIO 2: Servidor Web (Nginx Alpine)
# v5.0.0-13.4.1 / 15.2.3: a imagem final só contém os arquivos estáticos do
# build, sem código-fonte, testes, source maps ou metadados do git.
# ---------------------------------------------------------
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security-headers.inc.template /etc/nginx/templates/security-headers.inc.template

# Substitui apenas estas variáveis nos templates (as variáveis do nginx, como
# $uri e $host, permanecem intactas).
ENV API_UPSTREAM=http://zello-back \
    CSP_CONNECT_EXTRA="" \
    NGINX_ENVSUBST_FILTER="^(API_UPSTREAM|CSP_CONNECT_EXTRA)$"

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
