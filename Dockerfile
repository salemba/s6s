# Use Node 20
FROM node:20-alpine AS builder

# Install OpenSSL and libc6-compat for Prisma
RUN apk add --no-cache openssl libc6-compat

# Set working directory
WORKDIR /app

# Install Turbo globally
RUN npm install -g turbo

# Copy all package.json files to install dependencies
COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Generate Prisma Client
WORKDIR /app/apps/backend
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Build the backend
WORKDIR /app
RUN turbo run build --filter=backend

# --- Production Stage ---
# --- Production Stage ---
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Copy built artifacts and node_modules
COPY --from=builder /app .

# Set WORKDIR to the backend app's root directory for correct execution context
WORKDIR /app/apps/backend

# Expose the NestJS port
EXPOSE 3000

# Command to run the backend, using a path relative to the new WORKDIR
CMD ["node", "dist/main"]