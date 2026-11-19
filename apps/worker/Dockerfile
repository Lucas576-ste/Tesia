FROM node:22-slim
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NODE_ENV=production
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/worker/package.json apps/worker/
COPY packages/ia/package.json packages/ia/
COPY packages/prazos/package.json packages/prazos/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --prod --filter @tesia/worker...
COPY apps/worker apps/worker
COPY packages/ia packages/ia
COPY packages/prazos packages/prazos
COPY packages/shared packages/shared
USER node
WORKDIR /app/apps/worker
CMD ["node_modules/.bin/tsx", "src/index.ts"]
