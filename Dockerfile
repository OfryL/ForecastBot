FROM node:lts
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
VOLUME [ "/usr/src/app/config", "/usr/src/app/lib" ]
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
