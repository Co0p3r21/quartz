FROM node:22-slim AS deps
WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json* .
RUN npm ci

FROM deps AS source
WORKDIR /usr/src/app
COPY . .

# Build-only target for production pipelines that serve generated static files.
FROM source AS quartz-builder
CMD ["npx", "quartz", "build"]

# Preview target for local development parity with the old Docker behavior.
FROM source AS quartz-preview
CMD ["npx", "quartz", "build", "--serve"]
