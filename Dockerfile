# Specify a base image
FROM node:20.15.1-alpine3.20@sha256:34b7aa411056c85dbf71d240d26516949b3f72b318d796c26b57caaa1df5639a

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
