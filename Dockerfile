FROM node:20.10.0-alpine as base

FROM base as build
WORKDIR /app
COPY . ./
RUN npm ci
RUN npm run build

FROM base
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/api ./api
EXPOSE 6020
CMD ["node","dist/src/main"]