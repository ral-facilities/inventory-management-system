# Specify a base image
FROM node:22.21-alpine3.23@sha256:3404205afbfa99ffb663ec5ac28be64bd789541816885c75939c7d24dce06fa2 AS builder

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
