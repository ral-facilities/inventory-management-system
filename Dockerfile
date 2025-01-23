# Specify a base image
FROM node:22.13.1-alpine3.20@sha256:c52e20859a92b3eccbd3a36c5e1a90adc20617d8d421d65e8a622e87b5dac963

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
