#!/bin/bash
# Lets the task reach the hosts in allowed-domains.txt and
# nothing else, not even DNS. Runs once, as root, before the
# task: the names are looked up now and written to /etc/hosts.
set -euo pipefail

iptables -F OUTPUT
ipset destroy allowed 2>/dev/null || true
ipset create allowed hash:ip

while read -r domain; do
  case "$domain" in ''|'#'*) continue ;; esac
  ips=$(dig +short A "$domain" | grep -E '^[0-9.]+$' || true)
  if [ -z "$ips" ]; then
    echo "Cannot resolve $domain" >&2
    exit 1
  fi
  for ip in $ips; do
    ipset add allowed "$ip" -exist
    echo "$ip $domain" >> /etc/hosts
  done
done < /etc/sandbox/allowed-domains.txt

# No rule for port 53: a name lookup could carry data out.
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED \
  -j ACCEPT
iptables -A OUTPUT -m set --match-set allowed dst -j ACCEPT
iptables -A OUTPUT -j REJECT --reject-with icmp-admin-prohibited
ip6tables -P OUTPUT DROP 2>/dev/null || true

if dig +short +time=2 +tries=1 example.com > /dev/null \
     2>&1 || curl -s --connect-timeout 5 https://1.1.1.1 \
     > /dev/null; then
  echo "Firewall check failed: something is reachable" >&2
  exit 1
fi
echo "Firewall ready"
