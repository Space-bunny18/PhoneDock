# PhoneDock

**Turn your Windows PC into an Android control station.**

PhoneDock is an experimental Windows desktop application built with Electron, React, and TypeScript. It lets you connect an Android phone to your PC, mirror its screen, interact using your mouse and keyboard, and access useful device controls.

## Features

- **Live screen mirroring** — View your Android device inside the desktop app.
- **Mouse and keyboard control** — Interact with your phone from your PC.
- **Device information** — View available device details, battery, storage, RAM, and network information.
- **Quick controls** — Access Home, Back, Recent Apps, volume, mute, and lock actions.
- **USB and Wi-Fi ADB** — Connect through USB or wireless ADB.
- **Connection management** — Detect devices, refresh connections, and reconnect when needed.
- **Screenshots** — Capture your phone screen.
- **Mirror settings** — Configure supported mirroring options.
- **AI-assisted actions** — Experimental convenience features; availability depends on configuration.

## Tech Stack

- React
- TypeScript
- Electron
- Vite
- Android Debug Bridge (ADB)
- scrcpy

## Requirements

- Windows 10 or Windows 11
- Node.js and npm
- An Android phone with Developer options and USB debugging enabled
- A USB cable for initial connection, or a configured wireless ADB connection
- The compatible Windows scrcpy distribution and its required files

## Getting Started

### 1. Clone the repository

```powershell
git clone YOUR_GITHUB_REPOSITORY_URL
cd PhoneDock
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the repository URL.

### 2. Obtain scrcpy

Download a compatible Windows release from the official scrcpy repository:

https://github.com/Genymobile/scrcpy

Extract the distribution so the executable files are available at:

```text
PhoneDock/
├── engine/
│   └── scrcpy-win64-v4.1/
│       ├── adb.exe
│       ├── scrcpy.exe
│       ├── scrcpy-server
│       └── required supporting files
└── app/
```

The engine binaries are not included in this repository. Use a compatible distribution and follow its license terms.

### 3. Install dependencies

```powershell
cd app
npm install
```

### 4. Connect your Android phone

1. Enable Developer options on your phone.
2. Enable USB debugging.
3. Enable any additional USB debugging security permission required by your device.
4. Connect the phone and authorize the debugging prompt.
5. Unlock the phone.

Verify the connection from the project root:

```powershell
.\engine\scrcpy-win64-v4.1\adb.exe devices -l
```

Your device should appear with the status `device`.

### 5. Start PhoneDock

From the `app` directory:

```powershell
npm run dev
```

Keep the engine directory at the expected location relative to the project root.

## Troubleshooting

### Phone not detected

- Confirm USB debugging is enabled.
- Accept the authorization prompt on the phone.
- Try another USB cable or USB port.
- Check the output of `adb devices -l`.

### Mirroring works but input control fails

- Check the additional USB debugging security setting on your device.
- Reboot the phone after enabling that setting.
- Test scrcpy independently to determine whether the problem is device-related or application-related.

### Engine files cannot be found

Ensure the engine directory is named and located correctly:

`PhoneDock/engine/scrcpy-win64-v4.1/`

The required ADB, scrcpy, server, and supporting files must be present.

## Project Status

PhoneDock is an experimental project under active development. Features, compatibility, and setup instructions may change.

## License

The PhoneDock source code's license will be specified separately. scrcpy and its bundled dependencies remain subject to their respective licenses.