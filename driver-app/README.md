# NRC Driver App

Simple GPS tracking app for truck drivers. Works in background (phone locked).

## Build APK (for distribution)

1. Install Node.js if not already
2. In this folder, run:

```bash
npm install
npm install -g eas-cli
eas login     # create free account at expo.dev first
eas build --platform android --profile preview
```

Wait 5-10 min → download the APK from the Expo website → send to drivers.

## Test without building

Install "Expo Go" from Play Store, then:

```bash
npx expo start
```

Scan QR code with Expo Go app.
