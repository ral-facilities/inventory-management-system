# Specify a base image
FROM node:20.13.1-alpine3.19@sha256:291e84d956f1aff38454bbd3da38941461ad569a185c20aa289f71f37ea08e23

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
