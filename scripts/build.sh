docker build -t ofryl/forecastbot .
docker save ofryl/forecastbot | gzip > forecastbot.tar.gz
