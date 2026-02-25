FROM node:16-bullseye as builder
RUN mkdir -p /opt/services/front/src
WORKDIR /opt/services/front/src
COPY . ./
RUN npm install

FROM httpd:bullseye

ENV TZ=America/Sao_Paulo

RUN apt-get update \
    && apt-get install -yq tzdata locales -y \
    && dpkg-reconfigure --frontend noninteractive tzdata \ 
	&& locale-gen en_US.UTF-8

WORKDIR /usr/local/apache2/htdocs/

COPY httpd.conf /usr/local/apache2/conf/

COPY --from=builder /opt/services/front/src /usr/local/apache2/htdocs

RUN rm -Rf httpd.conf Dockerfile

RUN chown -R www-data:www-data /usr/local/apache2/htdocs

EXPOSE 80