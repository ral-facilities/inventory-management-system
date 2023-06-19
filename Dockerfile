# Specify a base image
FROM node:alpine

# Set the working directory
WORKDIR /inventory-management-system-run

COPY package.json .

# Copy the application files
COPY inventory-management-system/ inventory-management-system/

# Set the version of Yarn
RUN yarn set version 3.5.0

# Install dependencies
RUN yarn install

# # Specify the default command

CMD ["yarn", "inventory-management-system"]

# Expose the application port
EXPOSE 3000