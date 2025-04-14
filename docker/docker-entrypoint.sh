#!/bin/sh -eu

# Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
TEMPFILE="$(mktemp)"

# Set values in inventory-management-system-settings.json from environment variables
jq \
  --arg imsApiUrl "$IMS_API_URL" \
  --arg osApiUrl "$OS_API_URL" \
  --argjson maxAttachmentSizeBytes $MAX_ATTACHMENT_SIZE_BYTES \
  --argjson attachmentAllowedFileExtensions "$ATTACHMENT_ALLOWED_FILE_EXTENSIONS" \
  --argjson imageAllowedFileExtensions "$IMAGE_ALLOWED_FILE_EXTENSIONS" \
  --argjson maxImageSizeBytes $MAX_IMAGE_SIZE_BYTES \
  --arg pluginHost "$PLUGIN_HOST" \
  '.imsApiUrl = $imsApiUrl |
   .osApiUrl = $osApiUrl |
   .maxAttachmentSizeBytes = $maxAttachmentSizeBytes |
   .attachmentAllowedFileExtensions = $attachmentAllowedFileExtensions |
   .imageAllowedFileExtensions = $imageAllowedFileExtensions |
   .maxImageSizeBytes = $maxImageSizeBytes |
   .pluginHost = $pluginHost' \
  /usr/local/apache2/htdocs/inventory-management-system-settings.json > "$TEMPFILE"

cat "$TEMPFILE" > /usr/local/apache2/htdocs/inventory-management-system-settings.json
rm "$TEMPFILE"

# Run the CMD instruction
exec "$@"
