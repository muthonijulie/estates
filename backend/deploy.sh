#!/bin/bash

# Package the application
echo "Packaging application..."
tar -czf werent-backend.tar.gz Dockerfile docker-compose.yml package.json package-lock.json config/ controllers/ database/ middleware/ models/ routes/ server.js services/ utils/ .dockerignore

# Copy to remote server
echo "Copying to remote server..."
scp -P 22 werent-backend.tar.gz root@209.74.89.145:/root/

# SSH into server and deploy
echo "Deploying on remote server..."
ssh -p 22 root@209.74.89.145 << 'EOF'
  mkdir -p /root/werent-backend
  tar -xzf werent-backend.tar.gz -C /root/werent-backend
  cd /root/werent-backend
  docker-compose down
  docker-compose up -d --build
  rm -f /root/werent-backend.tar.gz
  echo "Deployment completed!"
EOF

# Clean up local package
rm werent-backend.tar.gz
echo "Local cleanup completed."