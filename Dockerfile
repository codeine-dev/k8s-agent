FROM debian

RUN apt-get update && \
    apt-get install -y bash curl openssh-client tini

WORKDIR /
RUN curl -LO https://dl.k8s.io/release/v1.24.0/bin/linux/amd64/kubectl && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && \
    rm kubectl

ADD start-agent /start-agent

ENV CODEINE_SSH_SERVER vps.codeine.dev
ENV CODEINE_SSH_PORT 2222

ENTRYPOINT [ "tini", "--" ]
CMD [ "/start-agent" ]
