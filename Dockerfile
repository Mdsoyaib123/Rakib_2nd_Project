# Build Stage
FROM node:24-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production Stage
FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["npm", "start"]
