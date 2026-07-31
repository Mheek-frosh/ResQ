import type { ExpoConfig } from "expo/config";

const googleMapsApiKey =
  process.env.GOOGLE_MAPS_API_KEY ??
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const config: ExpoConfig = {
  name: "ResQ",
  slug: "resq",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  backgroundColor: "#F6F9FC",
  android: {
    package: "com.resq.mobile",
    adaptiveIcon: {
      backgroundColor: "#2563EB"
    },
    config: googleMapsApiKey
      ? { googleMaps: { apiKey: googleMapsApiKey } }
      : undefined
  },
  ios: {
    bundleIdentifier: "com.resq.mobile",
    supportsTablet: true,
    config: googleMapsApiKey
      ? { googleMapsApiKey }
      : undefined
  },
  extra: {
    googleMapsApiKey: googleMapsApiKey ?? null,
    googleMapsMapId: process.env.GOOGLE_MAPS_MAP_ID ?? null
  }
};

export default config;
