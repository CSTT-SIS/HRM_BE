#!/bin/sh
DOCKER_NAME="warehouse-ms-be"
HOST_PORT="8080"
DOCKER_PORT="8080"

git pull
docker stop $DOCKER_NAME
docker rm $DOCKER_NAME
rm -rf dist
docker build -t $DOCKER_NAME .
docker run -p $HOST_PORT:$DOCKER_PORT -v $(pwd)/public:/home/project/public --detach --name $DOCKER_NAME --restart always $DOCKER_NAME
docker ps -a
docker logs -f $DOCKER_NAME