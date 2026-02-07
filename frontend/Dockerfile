FROM node:18-alpine as builder

WORKDIR /app

# Устанавливаем зависимости для сборки
RUN apk add --no-cache python3 make g++

# Копируем package.json
COPY package.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm install

# Копируем весь исходный код
COPY . .

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production
ENV VITE_API_URL=https://cinema.horizonserver.space/api

# Собираем приложение
RUN npm run build

# Production образ
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]