#!/bin/bash

# This script automates the deployment of the CIPC AI Agent to your
# configured Kubernetes cluster.

# It assumes you have `kubectl` installed and configured to point to your
# target cluster.

set -e # Exit immediately if a command exits with a non-zero status.

echo "Applying Kubernetes secrets..."
kubectl apply -f ../deployment/secrets.yml

echo "Applying Kubernetes deployments..."
kubectl apply -f ../deployment/node-deployment.yml
kubectl apply -f ../deployment/go-deployment.yml

echo "\nDeployment process initiated."
echo "You can monitor the status of the rollout with the following commands:"
echo "  kubectl rollout status deployment/node-server-deployment"
echo "  kubectl rollout status deployment/go-worker-deployment"

echo "\nTo see the public IP of your service (may take a few minutes to be assigned):"
echo "  kubectl get svc node-server-service"
