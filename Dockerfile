# Specify a base image
FROM node:22.12.0-alpine3.20@sha256:027911463b296bdaf6df82b5ccf2c6b290fee725d5fba6513a037ed019400625

# Set the working directory
WORKDIR /inventory-management-system-run

# Copy the application files
COPY . .

# Install dependencies
RUN yarn install

# Specify the default command
# Docker cannot run with open as it cannot find a display
CMD ["yarn", "dev-docker"]

# Expose the application port
EXPOSE 3000
