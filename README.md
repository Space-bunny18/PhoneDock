# PhoneDock

### Your Android phone. Your Windows desktop. One control station.

PhoneDock is an experimental Windows desktop application designed to bring Android device mirroring and essential phone controls directly to your PC. Built with **Electron, React, and TypeScript**, it combines screen mirroring, mouse and keyboard interaction, device information, connection management, and quick controls in one desktop workspace.

The goal is simple: make interacting with your Android phone from your Windows PC more convenient.

> **Project status:** Experimental and under active development. Device compatibility, configuration options, and features may vary.

---

## Features

- **Live Screen Mirroring** — View your Android phone inside the PhoneDock workspace.
- **Mouse Interaction** — Click, tap, and interact with supported phone interfaces from your PC.
- **Keyboard Input** — Type into supported text fields using your computer keyboard.
- **Device Dashboard** — View available device information, including battery, storage, RAM, Android version, and network details.
- **Quick Navigation** — Use Home, Back, and Recent Apps controls.
- **Device Controls** — Access volume up, volume down, mute, and lock actions.
- **USB Connectivity** — Connect your phone through Android Debug Bridge (ADB).
- **Wireless ADB** — Connect over Wi-Fi when wireless debugging is configured and supported.
- **Connection Management** — Detect devices, refresh connections, disconnect, and reconnect.
- **Screenshots** — Capture screenshots of your phone screen.
- **Mirror Settings** — Configure supported mirroring options.
- **Experimental AI Assistance** — Optional AI-related convenience features, depending on configuration.

## Tech Stack

| Technology | Purpose |
|---|---|
| Electron | Windows desktop application |
| React | User interface |
| TypeScript | Application logic and type safety |
| Vite | Development server and frontend tooling |
| ADB | Android device communication |
| scrcpy | Screen mirroring and device interaction |
| Lucide React | Interface icons |
| OpenAI SDK | Optional AI-related functionality |

---

## Requirements

Before running PhoneDock, make sure you have:

- Windows 10 or Windows 11.
- Node.js and npm installed.
- An Android phone with Developer options enabled.
- A USB data cable for initial USB setup.
- A compatible Windows scrcpy distribution.
- USB debugging authorization on your phone.
- Additional USB debugging security permissions if required by your device manufacturer.

Some Android manufacturers require extra security settings before allowing remote input. The exact setting names and behavior vary by device and Android version.

---

## Getting Started

### 1. Clone the repository

Open PowerShell or the VS Code terminal:

```powershell
git clone https://github.com/Space-bunny18/PhoneDock.git
cd PhoneDock
```

### 2. Download scrcpy

PhoneDock uses scrcpy and ADB, which are not bundled in this repository.

Download the official Windows distribution from:

**https://github.com/Genymobile/scrcpy**

Choose a compatible release, extract it, and place the required files in the following location:

```text
PhoneDock/
├── android-bridge/
├── app/
│   ├── electron/
│   ├── src/
│   ├── package.json
│   └── README.md
├── engine/
│   └── scrcpy-win64-v4.1/
│       ├── adb.exe
│       ├── scrcpy.exe
│       ├── scrcpy-server
│       └── supporting DLLs and files
├── .gitignore
└── README.md
```

**Important:** The engine directory must match the path expected by PhoneDock's Electron main process. The example above uses `scrcpy-win64-v4.1`; if you use another release, update the directory name or the application's engine path configuration accordingly.

Keep all required files from the downloaded distribution together. Do not copy only `scrcpy.exe` and `adb.exe` while omitting required server files or DLLs.

Review the scrcpy license and the licenses of bundled dependencies before redistributing them.

### 3. Install application dependencies

From the project root:

```powershell
cd app
npm install
```

### 4. Enable Android Developer options

On your phone:

1. Open **Settings → About phone**.
2. Locate the OS version or build number entry appropriate to your device.
3. Tap it repeatedly until Developer options are enabled. Some manufacturers require a device PIN.
4. Return to Settings and open **Developer options**.

The exact navigation differs between Android manufacturers.

### 5. Enable USB debugging

Inside Developer options:

1. Enable **USB debugging**.
2. If your manufacturer provides an additional setting such as **USB debugging (Security settings)**, enable it if remote input requires it.
3. Connect your phone to your PC using a USB data cable.
4. Unlock your phone.
5. Accept the **Allow USB debugging?** authorization prompt. Only authorize computers you trust.

Some devices require a restart after enabling their additional USB debugging security setting.

### 6. Verify the connection

Open a second PowerShell terminal at the PhoneDock project root:

```powershell
.\engine\scrcpy-win64-v4.1\adb.exe devices -l
```

Look for your phone in the output.

A device listed with the status `device` is authorized and available to ADB. If it shows `unauthorized`, unlock your phone and accept the authorization prompt.

### 7. Start PhoneDock

In the terminal where you installed dependencies, remain inside the `app` directory and run:

```powershell
npm run dev
```

Vite starts the development environment, and the Electron/Vite configuration should launch the desktop application.

Keep the terminal running while using the development build. Stop the development process with `Ctrl+C` when you're finished.

---

## How to Use PhoneDock

### 1. Connect your phone

Launch PhoneDock and connect your Android device using USB or your configured wireless ADB connection.

Wait for the device to be detected and its connection status to update. If several devices are connected, select the device you want to control when the device-selection interface is available.

### 2. Open the phone mirror

Start the mirroring session from the PhoneDock interface.

Once the phone screen appears inside the workspace, you can interact with it from your PC.

### 3. Control your phone with your mouse

Click inside the mirrored phone screen to interact with apps, navigate menus, and select buttons.

For the best results:

- Keep the phone awake and unlocked while establishing the connection.
- Click inside the mirror rather than outside its boundaries.
- Wait for the mirror to finish loading before interacting.
- Check the phone's security settings if the screen mirrors but clicks do not work.

Some protected screens, secure applications, and manufacturer-specific interfaces may restrict interaction.

### 4. Type using your keyboard

Click a text field inside the mirrored phone, such as a search box or message field
