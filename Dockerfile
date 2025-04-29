# Specify a base image
FROM node:20.19.1-alpine3.21@sha256:c628bdc7ebc7f95b1b23249a445eb415ce68ae9def8b68364b35ee15e3065b0f

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
