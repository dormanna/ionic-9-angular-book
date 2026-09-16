# The container a task runs in when nobody is watching:
# Node for the app, Claude Code, and the tools its firewall
# needs. Versions are pinned, so every run starts the same.
FROM node:26.8.2-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      git ca-certificates curl sudo iptables ipset dnsutils \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g @anthropic-ai/claude-code@2.1.270

COPY firewall.sh prepare.sh task.sh /usr/local/bin/
COPY allowed-domains.txt /etc/sandbox/
# The user node may run the firewall script as root, and
# nothing else. Git accepts the copied repository.
RUN chmod 755 /usr/local/bin/firewall.sh \
      /usr/local/bin/prepare.sh /usr/local/bin/task.sh \
 && echo 'node ALL=(root) NOPASSWD: /usr/local/bin/firewall.sh' \
      > /etc/sudoers.d/firewall \
 && git config --system --add safe.directory /tmp/source \
 && git config --system --add safe.directory /tmp/source/.git

ENV DISABLE_AUTOUPDATER=1 \
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1

USER node
WORKDIR /home/node
# The container only waits; start.sh runs the steps in it.
CMD ["sleep", "infinity"]
