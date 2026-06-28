FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

COPY start.sh .
RUN chmod +x start.sh

EXPOSE 8081
CMD ["sh", "start.sh"]