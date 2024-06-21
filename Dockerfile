# Specify a base image
FROM node:20.14.0-alpine3.20@sha256:6ce211be2226e86d61413dc19f11cab7ab96205837811c6356881a4157cea0c5

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
