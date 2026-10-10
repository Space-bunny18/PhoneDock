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

Click a text field inside the mirrored phone, such as a search box or message field, and type using your PC keyboard.

Keyboard behavior can vary depending on the active Android input method, the selected field, and the application being used.

If typing doesn't work, test standalone scrcpy first. This helps determine whether the problem is caused by Android permissions or PhoneDock's embedded mirror.

### 5. Use quick controls

PhoneDock provides quick actions for common navigation and device operations.

| Control | Purpose |
|---|---|
| Home | Return to the Android home screen |
| Back | Navigate to the previous screen |
| Recent Apps | Open the recent-apps interface |
| Volume Up | Increase device volume |
| Volume Down | Decrease device volume |
| Mute | Trigger the supported mute action |
| Lock | Lock the device using the supported command |

Quick actions depend on a healthy connection to the selected device. If an action doesn't respond, verify the device connection and try again.

### 6. View device information

Use the dashboard to review the device information PhoneDock makes available, such as:

- Device model and manufacturer.
- Android version.
- Battery information.
- Storage and memory details.
- Network information.

The exact fields displayed depend on the information available from the connected device.

### 7. Capture a screenshot

Use PhoneDock's screenshot action to capture the connected phone's screen.

Check the application's feedback and the configured save location if the screenshot doesn't appear where expected.

### 8. Change mirror settings

Open the mirror settings interface to adjust the supported options.

If you experience display or performance problems, restore the default settings before changing several options at once. Some changes may require restarting the mirroring session.

### 9. Disconnect or reconnect

When you finish, use the available connection controls to disconnect the device or stop the mirror.

If a connection drops, check the cable or Wi-Fi connection, confirm that the phone remains authorized, and use the reconnect or refresh controls.

---

## USB and Wi-Fi Connections

### USB connection

USB is the recommended starting point because it makes initial ADB authorization straightforward.

1. Connect the phone using a data-capable USB cable.
2. Enable USB debugging.
3. Authorize the computer on the phone.
4. Confirm that ADB lists the device.
5. Open the mirror in PhoneDock.

### Wireless ADB

Wireless connectivity requires additional configuration on the Android device.

Depending on the Android version, you may use **Wireless debugging** and pair the device with your computer, or use an existing authorized ADB-over-Wi-Fi connection.

The general workflow is:

1. Establish and authorize the ADB connection using the method supported by your device.
2. Ensure the phone and computer can communicate over the network.
3. Confirm that ADB detects the wireless device.
4. Select the wireless connection mode in PhoneDock when available.

Wireless debugging menus and pairing procedures vary by Android version. Use Android's official documentation for your device's supported method.

Do not expose an ADB debugging port to an untrusted network.

---

## Troubleshooting

### PhoneDock does not detect my phone

- Confirm USB debugging is enabled.
- Unlock the phone and accept the authorization prompt.
- Try another USB data cable or USB port.
- Run `adb devices -l` to inspect the connection.
- Restart ADB or reconnect the phone if necessary.

### The phone mirrors, but mouse and keyboard input do not work

First, test the official scrcpy executable independently:

```powershell
.\engine\scrcpy-win64-v4.1\scrcpy.exe
```

If standalone scrcpy also fails to accept input:

- Check the additional USB debugging security setting provided by your manufacturer.
- Reboot the phone after enabling that setting.
- Confirm the computer is authorized.
- Check the terminal output for permission errors.

If standalone scrcpy works but PhoneDock does not, investigate the embedded mirror and its input handling.

### The engine or executable cannot be found

Check that the engine files are in the expected project directory and that the path in the Electron main process matches the actual folder name.

Verify that the extracted distribution includes the scrcpy server and supporting DLLs.

### The mirror is slow or unstable

- Try a direct USB connection.
- Close unnecessary applications on the PC and phone.
- Restore default mirror settings.
- Reconnect the device and start a new mirroring session.
- Check the terminal output for scrcpy errors.

Performance depends on the PC, phone, connection quality, resolution, and frame-rate settings.

### Wireless ADB disconnects

- Check that the phone and PC remain connected to the network.
- Confirm the wireless debugging or ADB connection is still active.
- Reauthorize or pair the device if required.
- Try USB to determine whether the issue is specific to the wireless connection.

### AI-related features are unavailable

AI functionality may require valid local environment configuration and an API key. Never commit API keys or other credentials to GitHub.

If you enable an AI provider, follow its official setup instructions and keep credentials in a local environment file excluded by `.gitignore`.

---

## Security and Privacy Notes

- Only authorize trusted computers for USB debugging.
- Disable USB debugging when you no longer need it, if appropriate for your workflow.
- Do not expose ADB debugging connections to untrusted networks.
- Keep API keys and other credentials out of source control.
- PhoneDock relies on Android's device permissions and debugging mechanisms; behavior can vary by manufacturer.
- Review third-party licenses before redistributing scrcpy or its supporting binaries.

---

## Development

The application source is located in `app/`.

Common commands:

```powershell
# Install dependencies
npm install

# Start the development environment
npm run dev

# Run ESLint
npm run lint

# Build the frontend and invoke the configured Electron packaging process
npm run build
```

The `build` script invokes Electron Builder and may create packaged output. For ordinary development, use `npm run dev`.

The repository currently excludes local engine binaries, environment files, and generated build output. A compatible scrcpy distribution must be obtained separately.

---

## Roadmap

Potential areas for future development include:

- Improved device and connection diagnostics.
- More reliable recovery from dropped connections.
- Enhanced file transfer between PC and Android.
- Improved device compatibility and error reporting.
- Better setup documentation and first-run guidance.
- Additional productivity features for desktop-to-phone workflows.

The roadmap may change as development continues.

---

## Contributing

Contributions, suggestions, and bug reports are welcome.

When reporting an issue, include:

- Your Windows version.
- Your phone model and Android version.
- Whether you're using USB or Wi-Fi.
- Whether standalone scrcpy works.
- Relevant error messages, with private information removed.

Never include API keys, passwords, device authorization secrets, or other credentials in an issue report.

---

## License

The PhoneDock source code's license has not yet been specified. Until a license is added, do not assume that the project is open for unrestricted reuse or redistribution.

scrcpy and its supporting dependencies remain subject to their respective licenses.

---

**Built as an experiment in making Android more accessible from the Windows desktop.**
