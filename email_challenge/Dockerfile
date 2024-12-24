# Frontend Dockerfile

# Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=build /app /app
RUN npm install --production --frozen-lockfile

# Expose port and run npm start to serve the app
EXPOSE 3000
CMD ["npm", "start"]


