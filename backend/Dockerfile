FROM node:18-alpine

WORKDIR /app
COPY package.json ./
COPY .env ./
RUN npm install
COPY . .

EXPOSE 3001
CMD ["npm", "start"] 