# Specify a base image
FROM node:22.17.0-alpine3.21@sha256:a7c10fad0b8fa59578bf3cd1717b168df134db8362b89e1ea6f54676fee49d3b

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
