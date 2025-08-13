# 🚀 Claude-Flow Production Deployment Guide

## Table of Contents

- [Quick Start](#quick-start)
- [System Requirements](#system-requirements)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Observability](#monitoring--observability)
- [Security Configuration](#security-configuration)
- [Load Balancing](#load-balancing)
- [Production Setup](#production-setup)
- [Cloud Deployment](#cloud-deployment)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Production Installation

```bash
# Install from npm registry
npm install -g claude-flow@alpha

# Verify installation
npx claude-flow@alpha --version

# Initialize configuration
npx claude-flow@alpha init --force

# Test installation
npx claude-flow@alpha swarm "test deployment" --agents 3
```

### Prerequisites Check

```bash
# Check Node.js version (requires ≥20.0.0)
node --version

# Check npm version (requires ≥9.0.0)
npm --version

# Check system resources
free -h  # Memory check
df -h    # Disk space check

# Install required tools
apt-get update && apt-get install -y curl wget jq
```

---

## System Requirements

### Production Requirements

| Component | Minimum | Recommended | Enterprise |
|-----------|---------|-------------|------------|
| Node.js | v20.0.0 | v20 LTS | v20 LTS |
| RAM | 4 GB | 8 GB | 16 GB |
| CPU | 2 cores | 4 cores | 8+ cores |
| Disk Space | 2 GB | 10 GB | 50 GB |
| Network | 100 Mbps | 1 Gbps | 10 Gbps |
| Uptime SLA | 99% | 99.9% | 99.99% |

### Operating System Support

- **Linux**: Ubuntu 20.04+, CentOS 8+, RHEL 8+, Amazon Linux 2
- **Docker**: Alpine 3.18+, Ubuntu 22.04+
- **Kubernetes**: 1.24+
- **Cloud**: AWS, GCP, Azure, DigitalOcean

### Network Requirements

```bash
# Required ports
3000/tcp   # Main API server
8080/tcp   # MCP server
5432/tcp   # PostgreSQL (if used)
6379/tcp   # Redis (if used)
9090/tcp   # Prometheus metrics
3001/tcp   # Grafana dashboard

# Outbound connections
https://api.anthropic.com    # Claude API
https://api.openai.com       # OpenAI API (optional)
https://registry.npmjs.org   # Package registry
https://github.com           # Repository access
```

---

## Environment Variables

### Production Environment Configuration

```bash
# Create production environment file
cat > .env.production << 'EOF'
# === Core Configuration ===
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# === API Keys ===
CLAUDE_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...

# === Claude Flow Configuration ===
CLAUDE_FLOW_DEBUG=false
CLAUDE_FLOW_LOG_LEVEL=info
CLAUDE_FLOW_DATA_DIR=/app/data
CLAUDE_FLOW_MEMORY_DIR=/app/memory
CLAUDE_FLOW_CONFIG_DIR=/app/config

# === Performance Settings ===
CLAUDE_FLOW_MAX_AGENTS=100
CLAUDE_FLOW_MAX_CONCURRENT_TASKS=50
CLAUDE_FLOW_MEMORY_LIMIT=2048
CLAUDE_FLOW_CACHE_SIZE=512
CLAUDE_FLOW_WORKER_THREADS=8

# === Database Configuration ===
DATABASE_URL=postgresql://claude_flow:secure_password@postgres:5432/claude_flow
REDIS_URL=redis://redis:6379/0
CACHE_TTL=3600
CONNECTION_POOL_SIZE=20

# === Security ===
JWT_SECRET=your-secure-jwt-secret-256-bits
ENCRYPTION_KEY=your-encryption-key-256-bits
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# === Features ===
CLAUDE_FLOW_ENABLE_HOOKS=true
CLAUDE_FLOW_ENABLE_MCP=true
CLAUDE_FLOW_ENABLE_SWARM=true
CLAUDE_FLOW_ENABLE_METRICS=true
CLAUDE_FLOW_ENABLE_TRACING=true

# === Monitoring ===
PROMETHEUS_PORT=9090
GRAFANA_ADMIN_PASSWORD=secure-password
LOG_RETENTION_DAYS=30
METRICS_RETENTION_DAYS=90

# === Cloud Provider (AWS Example) ===
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=claude-flow-backups

# === Notifications ===
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
EMAIL_SMTP_HOST=smtp.sendgrid.net
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=apikey
EMAIL_SMTP_PASS=SG...
EOF
```

### Configuration Validation

```bash
# Validate environment configuration
npx claude-flow@alpha config validate --env production

# Test API connectivity
npx claude-flow@alpha diagnostics --api-check

# Verify database connection
npx claude-flow@alpha diagnostics --db-check
```

---

## Docker Deployment

### Production Docker Image

```dockerfile
# Production Dockerfile
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    postgresql-client \
    redis \
    curl \
    jq

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S claude-flow -u 1001 -G nodejs

# === Build Stage ===
FROM base AS builder

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production --no-audit --no-fund

# Copy source code
COPY src/ ./src/
COPY *.js *.ts *.json ./

# Build application
RUN npm run build

# === Production Stage ===
FROM base AS production

# Set environment
ENV NODE_ENV=production \
    CLAUDE_FLOW_DATA_DIR=/app/data \
    CLAUDE_FLOW_MEMORY_DIR=/app/memory \
    CLAUDE_FLOW_CONFIG_DIR=/app/config \
    CLAUDE_FLOW_LOG_LEVEL=info

# Copy built application
COPY --from=builder --chown=claude-flow:nodejs /app/dist ./dist
COPY --from=builder --chown=claude-flow:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=claude-flow:nodejs /app/package*.json ./

# Create data directories
RUN mkdir -p /app/data /app/memory /app/config /app/logs && \
    chown -R claude-flow:nodejs /app

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose ports
EXPOSE 3000 8080 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Switch to non-root user
USER claude-flow:nodejs

# Start application
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
```

### Docker Entrypoint Script

```bash
#!/bin/sh
# docker-entrypoint.sh

set -e

# Initialize configuration if not exists
if [ ! -f "/app/config/config.json" ]; then
    echo "Initializing Claude Flow configuration..."
    npx claude-flow@alpha init --force --config-dir /app/config
fi

# Wait for database if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database to be ready..."
    until pg_isready -d "$DATABASE_URL" > /dev/null 2>&1; do
        echo "Database not ready, waiting..."
        sleep 2
    done
    echo "Database is ready!"
fi

# Wait for Redis if REDIS_URL is set
if [ -n "$REDIS_URL" ]; then
    echo "Waiting for Redis to be ready..."
    until redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; do
        echo "Redis not ready, waiting..."
        sleep 2
    done
    echo "Redis is ready!"
fi

# Run database migrations
if [ "$NODE_ENV" = "production" ]; then
    echo "Running database migrations..."
    npx claude-flow@alpha db migrate
fi

# Start the application
echo "Starting Claude Flow..."
exec "$@"
```

### Production Docker Compose

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  # === Core Services ===
  claude-flow:
    image: claude-flow:2.0.0-production
    container_name: claude-flow-app
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      NODE_ENV: production
      CLAUDE_API_KEY: ${CLAUDE_API_KEY}
      DATABASE_URL: postgresql://claude_flow:${DB_PASSWORD}@postgres:5432/claude_flow
      REDIS_URL: redis://redis:6379/0
      CLAUDE_FLOW_MAX_AGENTS: 100
      CLAUDE_FLOW_MEMORY_LIMIT: 2048
    volumes:
      - claude-flow-data:/app/data
      - claude-flow-memory:/app/memory
      - claude-flow-config:/app/config
      - claude-flow-logs:/app/logs
    networks:
      - claude-flow-net
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # === Database Services ===
  postgres:
    image: postgres:15-alpine
    container_name: claude-flow-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: claude_flow
      POSTGRES_USER: claude_flow
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--auth-host=md5"
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - claude-flow-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U claude_flow -d claude_flow"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: claude-flow-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - claude-flow-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # === Load Balancer ===
  nginx:
    image: nginx:alpine
    container_name: claude-flow-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    networks:
      - claude-flow-net
    depends_on:
      - claude-flow
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # === Monitoring Stack ===
  prometheus:
    image: prom/prometheus:latest
    container_name: claude-flow-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    networks:
      - claude-flow-net
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=90d'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: claude-flow-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
      GF_INSTALL_PLUGINS: grafana-clock-panel,grafana-simple-json-datasource
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - claude-flow-net

  # === Backup Service ===
  backup:
    image: postgres:15-alpine
    container_name: claude-flow-backup
    restart: "no"
    volumes:
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh:ro
    networks:
      - claude-flow-net
    environment:
      DATABASE_URL: postgresql://claude_flow:${DB_PASSWORD}@postgres:5432/claude_flow
    depends_on:
      - postgres
    profiles:
      - backup

volumes:
  postgres-data:
  redis-data:
  prometheus-data:
  grafana-data:
  claude-flow-data:
  claude-flow-memory:
  claude-flow-config:
  claude-flow-logs:
  nginx-cache:

networks:
  claude-flow-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Building and Deployment

```bash
# Build production image
docker build -f Dockerfile.production -t claude-flow:2.0.0-production .

# Tag for registry
docker tag claude-flow:2.0.0-production your-registry.com/claude-flow:2.0.0

# Push to registry
docker push your-registry.com/claude-flow:2.0.0

# Deploy with Docker Compose
cp .env.production .env
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f claude-flow

# Scale services
docker-compose -f docker-compose.production.yml up -d --scale claude-flow=3

# Health check
curl -f http://localhost/health

# Stop services
docker-compose -f docker-compose.production.yml down
```

### Docker Registry Setup

```bash
# Setup private registry (optional)
docker run -d -p 5000:5000 --name registry \
  -v /opt/docker-registry:/var/lib/registry \
  registry:2

# Build and push to private registry
docker build -t localhost:5000/claude-flow:2.0.0 .
docker push localhost:5000/claude-flow:2.0.0

# Pull from registry
docker pull localhost:5000/claude-flow:2.0.0
```

---

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build for optimal size
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache sqlite

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create data directories
RUN mkdir -p /data/.claude-flow /data/.swarm /data/memory

# Set environment variables
ENV NODE_ENV=production \
    CLAUDE_FLOW_DATA_DIR=/data/.claude-flow \
    CLAUDE_FLOW_MEMORY_DIR=/data/.swarm \
    PORT=3000

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Run as non-root user
USER node

# Start application
CMD ["node", "dist/cli/main.js", "server"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  claude-flow:
    build: .
    image: claude-flow:latest
    container_name: claude-flow
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CLAUDE_FLOW_LOG_LEVEL=info
    volumes:
      - ./data:/data
      - ./config:/app/config
      - ./logs:/app/logs
    networks:
      - claude-flow-network
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    container_name: claude-flow-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - claude-flow-network

  postgres:
    image: postgres:15-alpine
    container_name: claude-flow-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=claude_flow
      - POSTGRES_USER=claude_flow
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - claude-flow-network

  nginx:
    image: nginx:alpine
    container_name: claude-flow-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - claude-flow
    networks:
      - claude-flow-network

volumes:
  redis-data:
  postgres-data:

networks:
  claude-flow-network:
    driver: bridge
```

### Building and Running

```bash
# Build Docker image
docker build -t claude-flow:latest .

# Run with Docker
docker run -d \
  --name claude-flow \
  -p 3000:3000 \
  -e CLAUDE_API_KEY=$CLAUDE_API_KEY \
  -v $(pwd)/data:/data \
  claude-flow:latest

# Run with Docker Compose
docker-compose up -d

# View logs
docker logs -f claude-flow

# Stop container
docker stop claude-flow

# Remove container
docker rm claude-flow
```

#### Services and Ingress

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: claude-flow-service
  namespace: claude-flow
  labels:
    app: claude-flow
spec:
  type: ClusterIP
  selector:
    app: claude-flow
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
  - name: mcp
    port: 8080
    targetPort: 8080
    protocol: TCP
  - name: metrics
    port: 9090
    targetPort: 9090
    protocol: TCP
---
# Load Balancer Service
apiVersion: v1
kind: Service
metadata:
  name: claude-flow-lb
  namespace: claude-flow
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "arn:aws:acm:us-west-2:123456789:certificate/..."
    service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "https"
spec:
  type: LoadBalancer
  selector:
    app: claude-flow
  ports:
  - name: https
    port: 443
    targetPort: 3000
    protocol: TCP
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
---
# Ingress for advanced routing
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: claude-flow-ingress
  namespace: claude-flow
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
spec:
  tls:
  - hosts:
    - api.claude-flow.com
    - mcp.claude-flow.com
    secretName: claude-flow-tls
  rules:
  - host: api.claude-flow.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: claude-flow-service
            port:
              number: 80
  - host: mcp.claude-flow.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: claude-flow-service
            port:
              number: 8080
```

### Service Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: claude-flow-service
  namespace: default
spec:
  type: LoadBalancer
  selector:
    app: claude-flow
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  - port: 8080
    targetPort: 8080
    protocol: TCP
    name: mcp
```

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: claude-flow-config
  namespace: default
data:
  config.json: |
    {
      "orchestrator": {
        "maxConcurrentAgents": 100,
        "taskQueueSize": 1000
      },
      "memory": {
        "backend": "postgres",
        "cacheSizeMB": 512
      }
    }
```

### Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: claude-flow-secrets
  namespace: default
type: Opaque
data:
  claude-api-key: <base64-encoded-api-key>
  database-url: <base64-encoded-database-url>
  jwt-secret: <base64-encoded-jwt-secret>
```

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: claude-flow-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: claude-flow
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Deployment Commands

```bash
# Create namespace
kubectl create namespace claude-flow

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# Check deployment status
kubectl get pods -n claude-flow
kubectl get svc -n claude-flow

# View logs
kubectl logs -f deployment/claude-flow -n claude-flow

# Scale deployment
kubectl scale deployment/claude-flow --replicas=5 -n claude-flow

# Update deployment
kubectl set image deployment/claude-flow claude-flow=claudeflow/claude-flow:v2.0.1 -n claude-flow

# Delete deployment
kubectl delete namespace claude-flow
```

---

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS

```bash
# Create task definition
aws ecs register-task-definition \
  --family claude-flow \
  --requires-compatibilities FARGATE \
  --network-mode awsvpc \
  --cpu 1024 \
  --memory 2048 \
  --container-definitions file://task-definition.json

# Create service
aws ecs create-service \
  --cluster default \
  --service-name claude-flow \
  --task-definition claude-flow:1 \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration file://network-config.json
```

#### Using AWS Lambda

```javascript
// handler.js
const { ClaudeFlow } = require('claude-flow');

exports.handler = async (event) => {
  const claudeFlow = new ClaudeFlow({
    apiKey: process.env.CLAUDE_API_KEY
  });
  
  const result = await claudeFlow.execute(event.task);
  
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
```

### Google Cloud Platform

```bash
# Deploy to Cloud Run
gcloud run deploy claude-flow \
  --image gcr.io/project-id/claude-flow:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="CLAUDE_API_KEY=$CLAUDE_API_KEY"

# Deploy to App Engine
gcloud app deploy app.yaml

# Deploy to GKE
gcloud container clusters create claude-flow-cluster \
  --num-nodes=3 \
  --zone=us-central1-a

kubectl apply -f k8s/
```

### Azure Deployment

```bash
# Deploy to Azure Container Instances
az container create \
  --resource-group claude-flow-rg \
  --name claude-flow \
  --image claudeflow/claude-flow:latest \
  --dns-name-label claude-flow \
  --ports 3000 \
  --environment-variables CLAUDE_API_KEY=$CLAUDE_API_KEY

# Deploy to Azure App Service
az webapp create \
  --resource-group claude-flow-rg \
  --plan claude-flow-plan \
  --name claude-flow \
  --deployment-container-image-name claudeflow/claude-flow:latest
```

### Heroku Deployment

```bash
# Create Heroku app
heroku create claude-flow

# Set environment variables
heroku config:set CLAUDE_API_KEY=$CLAUDE_API_KEY
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Scale dynos
heroku ps:scale web=3

# View logs
heroku logs --tail
```

---

## Production Setup

### SSL/TLS Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name claude-flow.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name claude-flow.example.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://claude-flow:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Setup

#### PostgreSQL

```sql
-- Create database
CREATE DATABASE claude_flow;

-- Create user
CREATE USER claude_flow WITH ENCRYPTED PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE claude_flow TO claude_flow;

-- Create tables
\c claude_flow;

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 0,
  assigned_agent UUID REFERENCES agents(id),
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_agent);
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="claude_flow"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup SQLite database
sqlite3 .swarm/memory.db ".backup '$BACKUP_DIR/memory_$DATE.db'"

# Backup PostgreSQL (if used)
pg_dump $DB_NAME > $BACKUP_DIR/postgres_$DATE.sql

# Backup configuration files
tar -czf $BACKUP_DIR/config_$DATE.tar.gz .claude-flow/

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz logs/

# Upload to S3
aws s3 cp $BACKUP_DIR/ s3://claude-flow-backups/ --recursive

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Monitoring Script

```bash
#!/bin/bash
# monitor.sh

# Check service health
health_check() {
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
  if [ $response -eq 200 ]; then
    echo "✅ Service is healthy"
  else
    echo "❌ Service is unhealthy (HTTP $response)"
    # Send alert
    send_alert "Claude Flow service is down"
  fi
}

# Check memory usage
check_memory() {
  memory=$(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2}')
  echo "📊 Memory usage: $memory"
  
  if [ ${memory%.*} -gt 90 ]; then
    send_alert "High memory usage: $memory"
  fi
}

# Check disk usage
check_disk() {
  disk=$(df -h / | awk 'NR==2{print $5}')
  echo "💾 Disk usage: $disk"
  
  if [ ${disk%?} -gt 90 ]; then
    send_alert "High disk usage: $disk"
  fi
}

# Send alert function
send_alert() {
  message=$1
  # Send to Slack
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"Alert: $message\"}" \
    $SLACK_WEBHOOK_URL
}

# Run checks
while true; do
  clear
  echo "Claude Flow Monitoring - $(date)"
  echo "================================"
  health_check
  check_memory
  check_disk
  sleep 60
done
```

---

## Monitoring & Maintenance

### Health Checks

```javascript
// health-check.js
const healthCheck = {
  service: async () => {
    try {
      const response = await fetch('http://localhost:3000/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  database: async () => {
    try {
      const db = new Database('.swarm/memory.db');
      const result = db.prepare('SELECT 1').get();
      return result !== undefined;
    } catch (error) {
      return false;
    }
  },
  
  memory: () => {
    const used = process.memoryUsage();
    const limit = 2 * 1024 * 1024 * 1024; // 2GB
    return used.heapUsed < limit;
  }
};

// Run health checks
setInterval(async () => {
  const results = {
    service: await healthCheck.service(),
    database: await healthCheck.database(),
    memory: healthCheck.memory()
  };
  
  console.log('Health Check Results:', results);
  
  if (!Object.values(results).every(v => v)) {
    console.error('Health check failed!');
    // Send alert
  }
}, 60000); // Every minute
```

### Log Rotation

```bash
# /etc/logrotate.d/claude-flow
/var/log/claude-flow/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 node node
    sharedscripts
    postrotate
        /usr/bin/killall -SIGUSR1 node
    endscript
}
```

### Performance Tuning

```bash
# System limits configuration
# /etc/security/limits.conf
node soft nofile 65536
node hard nofile 65536
node soft nproc 32768
node hard nproc 32768

# Sysctl optimization
# /etc/sysctl.conf
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
```

---

## Troubleshooting

### Common Issues

#### Issue: Installation Fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Use different registry
npm install --registry https://registry.npmjs.org/
```

#### Issue: SQLite Errors

```bash
# Rebuild SQLite
npm rebuild better-sqlite3

# Install from source
npm install better-sqlite3 --build-from-source

# Use in-memory fallback
export CLAUDE_FLOW_MEMORY_BACKEND=memory
```

#### Issue: Permission Denied

```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)

# Fix data directory permissions
chmod -R 755 .claude-flow .swarm

# Run with elevated permissions (not recommended)
sudo npm install -g claude-flow@alpha --unsafe-perm
```

#### Issue: API Key Not Working

```bash
# Verify API key
curl -H "Authorization: Bearer $CLAUDE_API_KEY" \
  https://api.anthropic.com/v1/models

# Check environment variable
echo $CLAUDE_API_KEY

# Set directly in config
claude-flow config set providers.anthropic.apiKey "your-key"
```

#### Issue: Port Already in Use

```bash
# Find process using port
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>

# Use different port
CLAUDE_FLOW_PORT=3001 claude-flow server
```

### Debug Mode

```bash
# Enable debug logging
export CLAUDE_FLOW_DEBUG=true
export CLAUDE_FLOW_LOG_LEVEL=debug

# Run with verbose output
claude-flow --verbose swarm "test"

# Enable trace logging
NODE_DEBUG=* claude-flow swarm "test"

# Profile performance
node --prof dist/cli/main.js swarm "test"
node --prof-process isolate-*.log > profile.txt
```

### Recovery Procedures

#### Database Recovery

```bash
# Backup corrupted database
cp .swarm/memory.db .swarm/memory.db.backup

# Attempt repair
sqlite3 .swarm/memory.db "PRAGMA integrity_check"
sqlite3 .swarm/memory.db ".recover" | sqlite3 .swarm/memory_recovered.db

# Restore from backup
cp backups/memory_latest.db .swarm/memory.db
```

#### Session Recovery

```bash
# List available sessions
claude-flow hive-mind sessions

# Recover specific session
claude-flow hive-mind resume <session-id>

# Export session data
claude-flow hive-mind export <session-id> > session-backup.json

# Import session data
claude-flow hive-mind import < session-backup.json
```

---

## Support Resources

### Getting Help

```bash
# Built-in help
claude-flow --help
claude-flow <command> --help

# Interactive help
claude-flow help interactive

# Generate diagnostic report
claude-flow diagnostics --full > diagnostic-report.txt
```

### Community Support

- **Discord**: [Join our community](https://discord.gg/claude-flow)
- **GitHub Issues**: [Report bugs](https://github.com/ruvnet/claude-flow/issues)
- **Documentation**: [Online docs](https://docs.claude-flow.ai)
- **Stack Overflow**: Tag `claude-flow`

### Professional Support

For enterprise support, contact: support@claude-flow.ai

---

<div align="center">

**Claude-Flow Deployment Guide v2.0.0**

[Back to README](../README.md) | [Architecture](ARCHITECTURE.md) | [API Docs](API_DOCUMENTATION.md)

</div>