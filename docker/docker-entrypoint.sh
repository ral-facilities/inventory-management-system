#!/bin/sh -eu

# Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
TEMPFILE="$(mktemp)"

# Set values in inventory-management-system-settings.json from environment variables
sed -e "s|\"imsApiUrl\": \".*\"|\"imsApiUrl\": \"$IMS_API_URL\"|" \
    -e "s|\"osApiUrl\": \".*\"|\"osApiUrl\": \"$OS_API_URL\"|" \
    -e "s|\"maxAttachmentSizeBytes\": \".*\"|\"maxAttachmentSizeBytes\": \"$MAX_ATTACHMENT_SIZE_BYTES\"|" \
    -e "s|\"pluginHost\": \".*\"|\"pluginHost\": \"$PLUGIN_HOST\"|" \
    /usr/local/apache2/htdocs/inventory-management-system-settings.json > "$TEMPFILE"

cat "$TEMPFILE" > /usr/local/apache2/htdocs/inventory-management-system-settings.json
rm "$TEMPFILE"

# Run the CMD instruction
exec "$@"
