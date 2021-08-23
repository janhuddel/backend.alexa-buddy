FROM node:14

WORKDIR /opt/alexa-buddy/

ADD node_modules/ /opt/alexa-buddy/node_modules/
ADD src/ /opt/alexa-buddy/src/

CMD ["node", "./src/index.js"]
