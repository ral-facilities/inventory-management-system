# Specify a base image
FROM node:26.13.1-alpine3.24@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS builder

# Set the working directory
WORKDIR /inventory-management-system-run

# Node 25+ no longer bundles corepack (and the official images no longer ship
# yarn), so install it to provide the yarn version pinned in package.json
RUN set -eux; \
    npm install --global corepack@0.36.0; \
    corepack enable

# Copy the application files
COPY . .

# Install dependencies
RUN yarn install

# Specify the default command
# Docker cannot run with open as it cannot find a display
CMD ["yarn", "dev-docker"]

# Expose the application port
EXPOSE 3000
