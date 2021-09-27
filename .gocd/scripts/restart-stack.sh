#!/bin/sh

ssh -T -oStrictHostKeyChecking=no admin@ds.rohwer.loc \
    "cd ${DOCKER_STACK_HOME}/stacks/homeautomation && sudo /usr/local/bin/docker-compose up -d"