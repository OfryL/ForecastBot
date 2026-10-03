FROM node:lts-alpine
# ffmpeg is only needed for the optional /liveVideo command
RUN apk add --no-cache ffmpeg tzdata
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
VOLUME [ "/usr/src/app/config", "/usr/src/app/lib" ]
EXPOSE 3000
CMD ["node", "src/app.js"]
