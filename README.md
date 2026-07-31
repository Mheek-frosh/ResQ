# ResQ mobile prototype

A front-end-only Expo/React Native prototype for emergency medical transport and normal ride booking.

## Run locally

```bash
npm install
npm run dev
```

The development server uses LAN mode on port `8082` so a physical phone on the same Wi-Fi network can connect through Expo Go. Port `8081` may be occupied by another local service.

If LAN discovery is blocked by the network or Windows Firewall, use:

```bash
npm run dev:tunnel
```

The app works without credentials by showing its built-in ResQ map illustration. To use the native Google Maps view in a development build, copy `.env.example` to `.env`, add `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, and rebuild the native app.

All trips, drivers, payments, countdowns, and status changes are simulated locally.
