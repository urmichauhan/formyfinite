FROM node:24-bookworm-slim AS builder
WORKDIR /application
RUN npm install -g pnpm@11.19.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY angular.json tsconfig.json tsconfig.app.json ./
COPY web ./web
RUN pnpm build
RUN pnpm prune --prod
FROM node:24-bookworm-slim
WORKDIR /application
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /application/node_modules ./node_modules
COPY --from=builder --chown=node:node /application/dist ./dist
COPY --chown=node:node package.json ./
COPY --chown=node:node api ./api
USER node
EXPOSE 3000
CMD ["node", "api/start.js"]
