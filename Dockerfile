# Specify a base image
FROM node:20.19.3-alpine3.21@sha256:82f7e381b009b4adc79cef79ec296896788bb91e522d277048b2d8ff6d976393

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
