#!/bin/sh -eu

# Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
TEMPFILE="$(mktemp)"

# Set values in inventory-management-system-settings.json from environment variables
sed -e "s|\"apiUrl\": \".*\"|\"apiUrl\": \"$API_URL\"|" \
    /usr/local/apache2/htdocs/inventory-management-system-settings.json > "$TEMPFILE"

cat "$TEMPFILE" > /usr/local/apache2/htdocs/inventory-management-system-settings.json
rm "$TEMPFILE"

# Run the CMD instruction
exec "$@"
