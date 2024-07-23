# Specify a base image
FROM node:20.15.1-alpine3.20@sha256:c42da7e09507eb725474dd3dbcbee248cb90a7d489f0f9aeb5d3222eab0728c8

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
