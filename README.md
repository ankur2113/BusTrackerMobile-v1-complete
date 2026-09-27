# BusTrackerMobile V1 Frontend

This is a complete Expo React Native frontend source project for the Bus Tracker V1 app.

It includes:

- Admin dashboard and management screens
- Coordinator trip, passenger, live-location, and emergency screens
- Commuter assigned-trip, check-in, progress, and bus tracking screens
- Backend contract fixes for check-in, manifest, live location, and assignments
- V1 additions: emergency/SOS, trip progress alerts, haptics, background-location foundation, offline GET cache, edge-to-edge Android config

## Important

This ZIP intentionally does **not** include generated/heavy local folders:

- `node_modules`
- `android`
- `.expo`
- build output folders

Generate them locally using the commands below.

## Backend URL

For Android emulator, `src/config/api.ts` is set to:

```ts
export const API_BASE_URL = "http://10.0.2.2:8080";
```

For a real Android phone on the same Wi-Fi, change it to your laptop IP, for example:

```ts
export const API_BASE_URL = "http://192.168.29.226:8080";
```

## Local setup

From the extracted frontend folder:

```powershell
cd C:\BusTrackerMobile
npm install
npx tsc --noEmit
npx expo prebuild --platform android --clean
```

After prebuild, make sure this file exists:

```text
android\local.properties
```

If missing, create it with:

```properties
sdk.dir=C:/Users/15593/AppData/Local/Android/Sdk
```

Then run:

```powershell
npx expo run:android
npx expo start --dev-client -c
```

Use `npm install`, not `npm ci`, because this package may need to refresh `package-lock.json` for local Expo package resolution.

## End-to-end test order

1. Start backend locally.
2. Login as ADMIN.
3. Create/verify coordinator and commuter users.
4. Create bus, stops, route, trip.
5. Assign commuter to route.
6. Login as COORDINATOR.
7. Start trip, send live location, mark passenger boarded/no-show, report emergency.
8. Login as COMMUTER.
9. View assigned trip, check in, track bus, see progress alert.
10. Login as ADMIN and view emergency reports.

## Notes

- Push notifications, home-screen widgets, passkeys/biometric login, QR boarding, and full native maps are not fully implemented here.
- Background location needs a real Android device test because emulators and Android battery rules can behave differently.
