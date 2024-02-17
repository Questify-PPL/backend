# Build image
FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY . .

# Production image
FROM node:20-alpine as production

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=build /usr/src/app/dist ./dist

COPY package*.json ./

RUN npm install --production

RUN rm package*.json

EXPOSE 3001

CMD ["node", "dist/main.js"]