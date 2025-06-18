FROM node:20-alpine AS base
WORKDIR /app
# Using pnpm for dependency management
RUN npm install -g pnpm
# Using bun for runtime
RUN npm install -g bun

# Install Deps
from base as dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cluster/package.json ./apps/cluster/
# COPY packages/core/package.json ./packages/core/
COPY package.json ./
RUN pnpm install --frozen-lockfile

from dependencies as builder
# Copy Code
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json tsconfig.json sst-env.d.ts ./
# Copy pre-fetched production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
# Copy all source code needed for the build
# COPY ./packages ./packages
COPY ./apps/cluster ./apps/cluster
