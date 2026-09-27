# Bus Tracker V1 additions

Implemented in this source bundle:

- Coordinator Emergency / SOS screen.
- Admin Emergency Reports screen with resolve action.
- Commuter smart arrival progress card using `/api/v1/commuter/trips/{tripId}/progress`.
- Improved commuter Track Bus UI with a live-map style preview and Google Maps deep link.
- Haptic feedback for commuter check-in/cancel, coordinator boarded/no-show, emergency and location actions.
- Offline GET cache in `httpClient.ts` using SecureStore for temporary network loss.
- Background location sharing hook using `expo-task-manager` + `expo-location`.
- Android edge-to-edge and predictive back enabled in `app.json`.
- Deep-link route prefixes in `AppNavigator` using the `bustrackermobile://` scheme.

Important local command:

```powershell
cd C:\BusTrackerMobile
npm install
npx expo prebuild --platform android --clean
npx expo run:android
```

Because `expo-task-manager` was added for background location, use `npm install`, not `npm ci`, so the lock file can refresh.
