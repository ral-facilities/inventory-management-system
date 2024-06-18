# Specify a base image
FROM node:20.14.0-alpine3.20@sha256:66c7d989b6dabba6b4305b88f40912679aebd9f387a5b16ffa76dfb9ae90b060

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
