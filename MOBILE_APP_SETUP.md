# SS Jewellery Creators mobile app

This project packages the existing jewellery marketplace for Android and iOS with Capacitor. The site is bundled into the app, and the published website is also installable as a home-screen web app.

## Android APK

The **Build Android app** workflow runs on pushes to `main` and can also be started manually from the repository's GitHub **Actions** tab. When it succeeds, download the `ss-jewellery-creators-android-apk` artifact and install `app-debug.apk` on an Android phone. A debug APK can be installed directly after allowing installation from that source; it is not a Play Store release.

To build locally, install Node.js 22, Java 21, and the Android SDK, then run:

```sh
npm ci
npm run android:sync
cd android
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

## iPhone and iPad

An **APK cannot be installed on iOS**. iOS uses an Apple-signed app instead. The `ios/` Xcode project is included; On a Mac, run `npm ci` and `npm run ios:sync`, then open `ios/App/App.xcodeproj` in Xcode, select a development team, and build to a device. Distributing through the App Store or TestFlight requires Apple's signing and developer-account setup.

Without Xcode signing, iPhone users can install the website as a home-screen app: open the live website in Safari, tap **Share**, then **Add to Home Screen**.

## Website updates

The Pages workflow deploys the web files from `www/`; the Android/iOS project files are not copied to the hosted website. Rebuild the native web assets with `npm run android:sync` or `npm run ios:sync` after site changes.

The app's marketplace, upload, and checkout features are the same as the website. Creator cloud uploads still need the separate Supabase project configuration in `supabase-config.js`, and payment processing is not connected.
