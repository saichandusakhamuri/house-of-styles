# House Of Styles Android App

This Android Studio project wraps the current website as a mobile app.

## What it does

- Loads the local website from `app/src/main/assets/www`
- Supports pull-to-refresh
- Keeps VIP and Custom Studio pages inside the app flow
- Works as a starting point for a future Play Store app

## Open in Android Studio

1. Open Android Studio
2. Choose `Open`
3. Select `C:\Users\saich\OneDrive\Documents\New project\android-app\HouseOfStylesApp`
4. Let Gradle sync
5. Run on an emulator or Android phone

## Important

The app currently wraps the local website files.

If you later deploy the site to Vercel and want the app to load the live website instead,
update `LOCAL_HOME` in `app/src/main/java/com/houseofstyles/app/MainActivity.java`.
