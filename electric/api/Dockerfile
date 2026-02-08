FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY server.ts tsconfig.json ./
CMD ["npx", "tsx", "server.ts"]
