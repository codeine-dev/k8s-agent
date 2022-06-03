FROM debian as base

RUN apt-get update && \
    apt-get install -y bash curl openssh-client tini

FROM base as kubectl
WORKDIR /kubectl
RUN curl -LO https://dl.k8s.io/release/v1.24.0/bin/linux/amd64/kubectl

FROM base as caddy
WORKDIR /caddy
RUN curl -L https://github.com/caddyserver/caddy/releases/download/v2.5.1/caddy_2.5.1_linux_amd64.tar.gz | tar zxv

FROM base

WORKDIR /staging
COPY --from=caddy /caddy/caddy caddy
COPY --from=kubectl /kubectl/kubectl kubectl

RUN install -o root -g root -m 0755 caddy /usr/local/bin/caddy
RUN install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

RUN rm -rf /staging

WORKDIR /
ADD start-agent /start-agent
ADD Caddyfile /etc/caddy/Caddyfile

ENV CODEINE_SSH_SERVER vps.codeine.dev
ENV CODEINE_SSH_PORT 2222

ENTRYPOINT [ "tini", "--" ]
CMD [ "/start-agent" ]
