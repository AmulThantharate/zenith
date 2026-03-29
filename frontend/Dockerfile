# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Use the production API URL by default
ENV REACT_APP_API_URL=/api
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Standard Nginx config
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
