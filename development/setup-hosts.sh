#!/bin/bash
# Run with sudo to add local development hosts entries
# Usage: sudo ./development/setup-hosts.sh

HOSTS_FILE="/etc/hosts"

declare -a ENTRIES=(
    "127.0.0.1   transvirex.local"
    "127.0.0.1   www.transvirex.local"
    "127.0.0.1   rabbitmq.transvirex.local"
)

if [ "$EUID" -ne 0 ]; then
    echo "This script must be run as root: sudo ./development/setup-hosts.sh"
    exit 1
fi

added=0
for entry in "${ENTRIES[@]}"; do
    domain=$(echo "$entry" | awk '{print $2}')
    if ! grep -q "$domain" "$HOSTS_FILE"; then
        echo "$entry" >> "$HOSTS_FILE"
        echo "Added: $entry"
        ((added++))
    else
        echo "Already exists: $domain"
    fi
done

if [ "$added" -gt 0 ]; then
    echo -e "\n$added entry/entries added. You can now access http://transvirex.local"
else
    echo -e "\nAll entries already present. Nothing to do."
fi
