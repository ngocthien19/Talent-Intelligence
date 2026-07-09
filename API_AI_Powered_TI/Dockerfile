FROM node:20-alpine
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    tzdata
ENV TZ=Asia/Ho_Chi_Minh
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]