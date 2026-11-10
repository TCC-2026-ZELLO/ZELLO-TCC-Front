# ---------------------------------------------------------
# ESTÁGIO 1: Build (Node.js 20 Alpine)
# ---------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund --quiet

COPY . .

ARG VITE_API_URL
ARG VITE_NOMINATIM_EMAIL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_NOMINATIM_EMAIL=$VITE_NOMINATIM_EMAIL

RUN npm run build

# ---------------------------------------------------------
# ESTÁGIO 2: Servidor Web (Nginx Alpine)
# ---------------------------------------------------------
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
