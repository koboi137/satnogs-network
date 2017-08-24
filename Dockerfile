FROM fedora:latest
RUN dnf -y install python python-pip python-devel git gcc libjpeg-turbo-devel findutils \
                   libxml2-devel libxslt-devel mysql-devel mysql npm redhat-rpm-config
RUN dnf -y clean all

COPY ./requirements/ /tmp/requirements/
RUN pip install --no-cache-dir --require-hashes --no-deps -r /tmp/requirements/dev.txt
RUN npm install -g eslint stylelint

WORKDIR /app
COPY . /app

EXPOSE 80

CMD ["./docker/run-docker.sh"]
