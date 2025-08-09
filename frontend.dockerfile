FROM node:20

# Set the working directory in the container
WORKDIR /app

# Declare the build argument
ARG VITE_API_BASE_URL

# Set it as an environment variable for the build process
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package.json and bun.lockb
COPY frontend/package.json ./
COPY frontend/bun.lockb ./

# Install dependencies using Bun
RUN npm install -g bun
RUN bun install --frozen-lockfile

# Copy the rest of the frontend application code
COPY frontend/ /app/

# Make port 5173 available to the world outside this container
EXPOSE 5173

# Run the development server
CMD ["bun", "run", "dev", "--host"]