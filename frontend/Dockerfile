FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV VITE_API_URL=https://cinema.horizonserver.space/api

# Собираем приложение
RUN npm run build

# Используем nginx для раздачи статики
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]