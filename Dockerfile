FROM node:12

WORKDIR /usr/src/app

COPY . . 

RUN npm install

CMD [ "node", "index.js" ]
