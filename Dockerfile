# Specify a base image
FROM node:20.18.3-alpine3.21@sha256:053c1d99e608fe9fa0db6821edd84276277c0a663cd181f4a3e59ee20f5f07ea

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
