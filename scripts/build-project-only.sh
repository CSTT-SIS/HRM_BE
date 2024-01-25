#!/bin/sh
# docker-compose down
git pull
docker-compose up -d --build -f docker-compose-project-only.yml