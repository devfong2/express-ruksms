FROM node:16.14.2
RUN mkdir -p /home/app
COPY . /home/app
WORKDIR /home/app
RUN  yarn install
CMD [ "node","index.js" ]  