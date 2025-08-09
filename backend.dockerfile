# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install uv, the package manager
RUN pip install uv

# Copy the requirements file into the container
COPY scamscanner/pyproject.toml scamscanner/pyproject.toml
COPY scamscanner/requirements.txt scamscanner/requirements.txt

# Install any needed packages specified in requirements.txt
RUN uv pip install --system --no-cache -r scamscanner/requirements.txt

# Copy the rest of the backend application code
COPY scamscanner/ /app/scamscanner/

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["uvicorn", "scamscanner.app:app", "--host", "0.0.0.0", "--port", "8000"]