docker stop forecastbot
docker load -i /b/forecastBot/forecastbot.tar.gz
docker rename forecastbot bot_tmp
docker create --name="forecastbot" --net=host -e PUID=1000 -e PGID=1000 -e "TZ=Asia/Jerusalem" \
--volumes-from bot_tmp \
--restart unless-stopped \
ofryl/forecastbot:latest
# -v forecastbotlib/forecastBot/lib:/usr/src/app/lib \
# -v forecastbotlib/config:/usr/src/app/config \
docker stop bot_tmp
docker start forecastbot
docker rm bot_tmp
