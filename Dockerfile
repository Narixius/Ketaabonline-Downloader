FROM node:latest

RUN apt-get update

RUN mkdir -p /usr/src/kod
WORKDIR /usr/src/kod

COPY package.json /usr/src/kod
RUN npm install

COPY . /usr/src/kod

CMD ["node", "index.js"]
