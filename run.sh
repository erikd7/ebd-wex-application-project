#!/bin/bash

# Run `sh run.sh` to run the app locally

echo "Running Erik's Wex app locally..."

if ! docker info >/dev/null 2>&1; then
  echo "The app needs Docker to be installed and running. Exiting..."
  exit 1
fi

docker compose up