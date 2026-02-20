FROM node:18-alpine

WORKDIR /app

# Install openssl for cert generation
RUN apk add --no-cache openssl

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Copy entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose the dev server port
EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "run", "dev-server"]