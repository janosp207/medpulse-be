# Use an official Node.js runtime as the parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your app's source code to the working directory
COPY . ./

# Copy the .env file to the working directory
COPY .env ./

# Expose port 3333 to the outside
EXPOSE 3333

# Command to start the app
CMD ["node", "ace", "serve", "--watch"]
