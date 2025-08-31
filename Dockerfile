# Specify a base image
FROM node:22.19.0-alpine3.21@sha256:6b2127043c2faa4f15cdcdeb65a39fc9afbecf5559301898b754bbff561a8aa9

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
