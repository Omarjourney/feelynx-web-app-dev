# Subresource Integrity Maintenance

This project loads the LiveKit client from jsDelivr in `livekit-demo.html`. When upgrading the CDN version, regenerate the Subresource Integrity (SRI) hash so browsers can verify the download.

## Updating the LiveKit CDN Hash

1. Update the desired package version in `livekit-demo.html`.
2. Install the matching package version locally so you can hash the exact file served by the CDN:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Compute the SHA-384 hash of the UMD bundle that the CDN hosts and encode it for SRI:
   ```bash
   openssl dgst -sha384 -binary node_modules/livekit-client/dist/livekit-client.umd.js | openssl base64 -A
   ```
4. Prefix the resulting value with `sha384-` and paste it into the `integrity` attribute of the `<script>` tag in `livekit-demo.html`. Keep the `crossorigin="anonymous"` attribute alongside it.
5. Commit the updated HTML file and document the change in version control.

> **Note:** If CDN access is available from your environment you can replace step 2 and 3 with `npx --yes sri https://cdn.jsdelivr.net/npm/livekit-client@<VERSION>/dist/livekit-client.umd.js`.

## Validating the Change

After updating the hash:

- Open `livekit-demo.html` in a browser and confirm the console does not report SRI or CSP violations.
- If working locally, run `npm run lint` or `npm run test` to ensure the project still builds.
