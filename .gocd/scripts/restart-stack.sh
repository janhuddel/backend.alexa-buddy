#!/bin/sh

ssh -T -oStrictHostKeyChecking=no admin@ds.rohwer.loc \
    "cd ${DOCKER_STACK_HOME}/stacks/home-automation && sudo /usr/local/bin/docker-compose up -d"