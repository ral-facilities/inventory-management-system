# Specify a base image
FROM node:20.15.0-alpine3.20@sha256:0ccc08fadfe696f2959f59404ce0d90461c834a7465c4a563c62c0fef4089885

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
