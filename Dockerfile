# Specify a base image
FROM node:20.14.0-alpine3.19@sha256:2d0ce60a5c7bfa2bcdcfa7d463d8f8b7b16cab55051562606a9dc32c8a8169a9

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
