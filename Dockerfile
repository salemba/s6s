# Use Node 20
FROM node:20-alpine AS builder

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
RUN npx prisma generate

# Build the backend
WORKDIR /app
RUN turbo run build --filter=backend

# --- Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built artifacts and node_modules
COPY --from=builder /app .

# Expose the NestJS port
EXPOSE 3000

# Command to run the backend
CMD ["node", "apps/backend/dist/main"]