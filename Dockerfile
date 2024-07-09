# Build stage
FROM node:20.10.0-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build the app
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Run stage
FROM node:20.10.0-alpine as run

ENV NODE_ENV=production

WORKDIR /app

# Copy the build directory from the build stage
COPY --from=build /app/build ./build
# Copy pruned node_modules
COPY --from=build /app/node_modules ./node_modules
# Copy package files
COPY --from=build /app/package.json ./package.json
# Copy env
COPY --from=build /app/.env ./.env

# Expose the port the app runs on
EXPOSE 3000

# Set the entry point to your application's server entry
ENTRYPOINT ["node", "--env-file=.env", "--experimental-modules", "build/index.js"]