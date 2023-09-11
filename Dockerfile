# This docker file is only used for development purposes.

FROM mcr.microsoft.com/devcontainers/javascript-node:18-bullseye

ARG BUN_INSTALL=/usr/local
RUN curl -fsSL https://bun.sh/install > /root/install-bun.sh \
    && chmod +x /root/install-bun.sh \
    && /root/install-bun.sh bun-v1.0.0 \
    && rm /root/install-bun.sh

CMD ["bash"]
