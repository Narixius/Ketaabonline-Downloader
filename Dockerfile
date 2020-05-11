FROM node:latest

RUN apt-get update || : && apt-get install python -y
RUN apt-get install ffmpeg -y

RUN mkdir -p /usr/src/kod
WORKDIR /usr/src/kod

COPY package.json /usr/src/kod
RUN yarn

COPY . /usr/src/kod

CMD ["node", "index.js"]
