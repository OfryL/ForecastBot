FROM node:lts
#RUN apk add  --no-cache ffmpeg
WORKDIR /usr/src/app
COPY package*.json ./
RUN NODE_ENV=production npm install
COPY . .
VOLUME [ "/usr/src/app/config", "/usr/src/app/lib" ]
EXPOSE 3000
CMD ["npm", "start"]
