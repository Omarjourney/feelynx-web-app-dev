FROM node:20-alpine
WORKDIR /app

# Install dependencies first for better caching
COPY package.json ./
RUN npm ci --only=production

# Copy app source
COPY server.js ./

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001
CMD ["npm", "start"]
