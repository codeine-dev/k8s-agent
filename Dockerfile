FROM debian

RUN apt-get update && \
    apt-get install -y bash curl openssh-client tini

WORKDIR /
ADD start-agent /start-agent

ENV CODEINE_SSH_SERVER vps.codeine.dev
ENV CODEINE_SSH_PORT 2222
ENV CODEINE_K8S_API_HOST kubernetes.default.svc
ENV CODEINE_K8S_API_PORT 443

ENTRYPOINT [ "tini", "--" ]
CMD [ "/start-agent" ]
