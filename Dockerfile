# Specify a base image
FROM node:20.11-alpine3.19

# Set the working directory
WORKDIR /inventory-management-system-run

# Copy the application files
COPY . .

# Install dependencies
RUN yarn install

# # Specify the default command

CMD ["yarn", "start"]

# Expose the application port
EXPOSE 3000