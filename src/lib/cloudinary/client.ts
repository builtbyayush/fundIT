import { v2 as cloudinary } from "cloudinary";

import { getCloudinaryEnvConfig, isCloudinaryConfigured } from "@/lib/cloudinary/config";

let configured = false;

export function getCloudinaryClient() {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  if (!configured) {
    const config = getCloudinaryEnvConfig();
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export function resetCloudinaryClientForTests() {
  configured = false;
}
