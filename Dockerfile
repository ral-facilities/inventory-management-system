# Specify a base image
FROM node:alpine

# Set the working directory
WORKDIR /inventory-management-system-run

# Copy the application files
COPY . .

# Set the version of Yarn
RUN yarn set version 3.5.0

# Install dependencies
RUN yarn install

# # Specify the default command

CMD ["yarn", "start"]

# Expose the application port
EXPOSE 3000