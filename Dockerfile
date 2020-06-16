FROM node:latest
RUN apt-get update
RUN apt-get install -y sox
COPY package*.json ./
#COPY deepspeech-0.7.3-models.* ./
#curl deepspeech files

COPY . .
RUN npm install

EXPOSE 8080
CMD [ "node", "http-server-upload.js" ]
