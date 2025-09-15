# Stage 1: Build
FROM python:3.9-slim as builder

WORKDIR /app

# Create a non-root user
RUN useradd -ms /bin/bash appuser

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Final image
FROM python:3.9-slim

WORKDIR /app

# Create a non-root user
RUN useradd -ms /bin/bash appuser

# Copy installed packages from builder stage
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copy the application
COPY CIPC_Agent.py .

# Switch to non-root user
USER appuser

# Expose port and run the application
EXPOSE 8501
CMD ["streamlit", "run", "CIPC_Agent.py"]
