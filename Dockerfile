# Specify a base image
FROM node:22.22-alpine3.23@sha256:e4bf2a82ad0a4037d28035ae71529873c069b13eb0455466ae0bc13363826e34 AS builder

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
