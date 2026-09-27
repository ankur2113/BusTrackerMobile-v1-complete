# Bus Tracker Frontend Integration Changes

This source package aligns the React Native frontend with the backend DTOs and role-specific APIs.

## Key fixes

- Fixed commuter check-in contract to send `tripStopId` to `POST /api/v1/commuter/trips/{tripId}/check-in`.
- Fixed commuter cancel check-in path to `POST /api/v1/commuter/trips/{tripId}/check-in/cancel`.
- Fixed commuter check-in list path to `GET /api/v1/commuter/check-in`.
- Fixed coordinator manifest shape to use `StopPassengerManifestResponse[]`.
- Added coordinator no-show action for `POST /api/v1/coordinator/trips/{tripId}/check-ins/{checkInId}/no-show`.
- Fixed coordinator trip stop status actions to return a single `TripStop`, then reload trip details.
- Fixed live-location request/response fields: `speedMps`, `locationRecordedAt`, `locationReceivedAt`.
- Fixed live-location paths to use singular `/location`.
- Updated assignment flow to select a commuter first, load assignments for that commuter, and only show stops attached to the selected route.
- Added frontend API coverage for admin update/delete/cancel endpoints and auth `/me`.

## Important local commands

```powershell
cd C:\BusTrackerMobile
npm install
npx expo install
npx tsc --noEmit
npx expo run:android
```

Keep `src/config/api.ts` as `http://10.0.2.2:8080` for Android Emulator local backend testing.
