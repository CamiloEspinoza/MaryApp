# Mobile App - Local Development Setup

Guide to build and install the AI Tourist Guide app on your iPhone from your local machine.

## Prerequisites

- **macOS** with Xcode installed (required for iOS builds)
- **Node.js** >= 22
- **pnpm** >= 10 (`npm install -g pnpm`)
- **Apple Developer account** (free account works for personal device testing)
- **iPhone** connected via USB (or same Wi-Fi network)

## 1. Install Dependencies

From the **monorepo root** (`/MaryApp`):

```bash
pnpm install
```

## 2. Generate Native iOS Project

From the mobile app directory:

```bash
cd apps/mobile
pnpm prebuild
```

This generates the `ios/` directory with a native Xcode project. If you need a clean regeneration:

```bash
pnpm prebuild:clean
```

## 3. Build and Run on iPhone

### Option A: Via CLI (recommended first time)

Connect your iPhone via USB, then:

```bash
pnpm ios --device
```

Expo will list connected devices. Select your iPhone.

> **First time only:** You'll need to trust the developer certificate on your iPhone:
> Settings > General > VPN & Device Management > Developer App > Trust

### Option B: Via Xcode

1. Open `ios/AITouristGuide.xcworkspace` in Xcode
2. Select your iPhone as the build target
3. In **Signing & Capabilities**, select your Apple Developer team
4. Press **Cmd+R** to build and run

## 4. Start the Dev Server

Once the app is installed on your iPhone, start the Metro bundler:

```bash
pnpm dev
```

This runs `expo start --dev-client`. The app on your iPhone will connect to this dev server for hot reloading.

> **Important:** Your iPhone and your Mac must be on the **same Wi-Fi network** for the dev server connection to work.

## 5. Day-to-Day Development

After the initial setup, your daily workflow is:

```bash
# From monorepo root
pnpm --filter mobile dev
```

Or from `apps/mobile`:

```bash
pnpm dev
```

Open the app on your iPhone — it will auto-connect to the dev server.

## Troubleshooting

### "No development build available"
You need to rebuild the native app. Run `pnpm prebuild:clean && pnpm ios --device`.

### App can't connect to dev server
- Ensure both devices are on the same Wi-Fi
- Check your Mac's firewall isn't blocking port 8081
- Try shaking the phone to open the dev menu and manually enter your Mac's IP

### Xcode signing errors
- Open `ios/AITouristGuide.xcworkspace` in Xcode
- Go to the target's **Signing & Capabilities** tab
- Select your personal team and let Xcode manage signing automatically

### "Untrusted Developer" on iPhone
Go to Settings > General > VPN & Device Management > select the developer profile > Trust.

### Need to reset everything
```bash
pnpm prebuild:clean
rm -rf node_modules
cd ../..
pnpm install
cd apps/mobile
pnpm prebuild
pnpm ios --device
```

## Project Structure

```
apps/mobile/
  app/                # Screens (expo-router file-based routing)
    _layout.tsx       # Root layout
    index.tsx         # Home screen (Hello World)
  assets/             # Images, icons
  global.css          # Tailwind CSS entry point (v4 @import syntax)
  postcss.config.mjs  # PostCSS with @tailwindcss/postcss
  metro.config.js     # Metro bundler with NativeWind
  babel.config.js     # Babel preset (expo only, no nativewind plugin)
  app.json            # Expo configuration
```

## Tech Stack

- **Expo SDK 55** with development builds (not Expo Go)
- **expo-router** for file-based navigation
- **NativeWind v5** (preview) + Tailwind CSS 4 for styling
- **TypeScript** with strict mode
