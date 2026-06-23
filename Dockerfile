# Build stage
FROM oven/bun:1.2 AS build
WORKDIR /app
COPY package.json bunfig.toml* ./
RUN bun install --frozen-lockfile || bun install
COPY . .
RUN bun run build

# Runtime
FROM oven/bun:1.2-slim
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["bun", ".output/server/index.mjs"]
