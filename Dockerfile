# multi stage docker file for building frontend docker image with nginx.

# stage 1: build the angular app with prod environment.
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build -- --configuration=production

# stage 2: serve the built application with nginx
FROM nginx:1.25-alpine AS prod-stage

COPY --from=build-stage /app/dist/event-frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


