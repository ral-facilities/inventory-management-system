# Specify a base image
FROM node:20.14.0-alpine3.20@sha256:928b24aaadbd47c1a7722c563b471195ce54788bf8230ce807e1dd500aec0549

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
