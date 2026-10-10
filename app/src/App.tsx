import { useEffect, useState } from "react";
import DeviceHeader from "./components/DeviceHeader";
import MirrorWorkspace from "./components/MirrorWorkspace";
import "./App.css";
import { validateAIResult } from "./ai/aiCommandParser";
import { providerManager } from "./ai/providers/providerManager";
import PhoneDashboard from "./components/PhoneDashboard";
import {
  executeActions,
  type PhoneActionHandlers,
} from "./ai/actionExecutor";
declare global {
  interface Window {
    phoneDock: {
      version: string;

      scanPhone: () => Promise<{
        success: boolean;

        devices: {
          id: string;
          status: string;
          model?: string;
          manufacturer?: string;
          androidVersion?: string;
          battery?: string;
          charging?: boolean;
          storage?: {
            total: string;
            used: string;
            free: string;
          };
          ram?: {
            total: string;
            available: string;
          };
          network?: {
            type: string;
            ip: string;
          };
        }[];

        error?: string;
      }>;
      getAdbDevices: () => Promise<{
        success: boolean;
        devices: {
          id: string;
          status: string;
          type: "usb" | "wifi";
        }[];
        error?: string;
      }>;
      phoneHome: (
        deviceId: string
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      phoneBack: (
        deviceId: string
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      phoneRecent: (
        deviceId: string
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      phoneVolumeUp: (
        deviceId: string
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      phoneVolumeDown: (
        deviceId: string
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      phoneMute: (
        deviceId: string
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      phoneLock: (
        deviceId: string
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      mirrorPhone: (
        deviceId: string,
        settings: {
          quality: "performance" | "balanced" | "quality";
          fps: string;
          resolution: string;
          bitrate: string;
        }
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      getPhoneMirrorWindow: () => Promise<string>;
      embedPhoneMirror: (
        mirrorHwnd: string
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;
      positionPhoneMirror: (bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      }) => Promise<{
        success: boolean;
        error?: string;
      }>;
      startMirrorTracking: (
        mirrorHwnd: string,
        bounds: {
          x: number;
          y: number;
          width: number;
          height: number;
        }
      ) => Promise<{
        success: boolean;
        error?: string;
      }>;

      stopMirrorTracking: () => Promise<{
        success: boolean;
      }>;
      closePhoneMirror: () => Promise<{
        success: boolean;
      }>;
      focusPhoneMirror: () => Promise<string>;
      takeScreenshot: (deviceId: string) => Promise<{
        success: boolean;
        path?: string;
        error?: string;
      }>;
      updateMirrorBounds: (bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      }) => Promise<{
        success: boolean;
      }>;
      onMirrorClosed: (
        callback: (code: number | null) => void
      ) => () => void;
      enableWifiAdb: (deviceId: string) => Promise<{
        success: boolean;
        ipAddress?: string;
        deviceId?: string;
        message?: string;
        error?: string;
      }>;
      askAI: (
        command: string
      ) => Promise<{
        success: boolean;
        result?: string;
        error?: string;
      }>;
      network?: {
        type: string;
        ip: string;
      };
    };
  }
}

function App() {
  const [mirrorFullscreen, setMirrorFullscreen] =
    useState(false);
  const [connectionMode, setConnectionMode] =
    useState<"usb" | "wifi" | "auto">("usb");
  const [activeConnection, setActiveConnection] =
    useState<"usb" | "wifi" | null>(null);
  const [connectionAddress, setConnectionAddress] =
    useState("");
  const [connectionHealth, setConnectionHealth] =
    useState<"checking" | "connected" | "offline">("checking");
  const [mirrorStarting, setMirrorStarting] =
  useState(false);
  const [mirrorStatus, setMirrorStatus] =
    useState("Ready");
  const [phoneCommand, setPhoneCommand] = useState("");
  const [aiStatus, setAiStatus] = useState<
    "local" | "cloud" | "processing"
  >("local");
  const [aiMessage, setAiMessage] = useState("");
  const [mirrorSettings, setMirrorSettings] = useState({
      quality: "balanced" as
        | "performance"
        | "balanced"
        | "quality",
      fps: "30",
      resolution: "960",
      bitrate: "4",
    });
  const engineVersion =
    window.phoneDock?.version ?? "unknown";

  const [scanning, setScanning] = useState(false);

  const [deviceStatus, setDeviceStatus] =
    useState("No phone connected");

  const [deviceModel, setDeviceModel] =
    useState("");

  const [deviceManufacturer, setDeviceManufacturer] =
    useState("");

  const [deviceId, setDeviceId] =
    useState("");
  const [selectedDeviceId, setSelectedDeviceId] =
  useState("");
  const [availableDevices, setAvailableDevices] =
    useState<
      {
        id: string;
        status: string;
        model?: string;
        manufacturer?: string;
        androidVersion?: string;
        battery?: string;
        charging?: boolean;
        storage?: {
          total: string;
          used: string;
          free: string;
        };
        ram?: {
          total: string;
          available: string;
        };
        network?: {
          type: string;
          ip: string;
        };
      }[]
    >([]);
  

  const [androidVersion, setAndroidVersion] =
    useState("");

  const [battery, setBattery] =
    useState("");
  const [charging, setCharging] = useState(false);
  const [deviceStorage, setDeviceStorage] = useState<{
    total: string;
    used: string;
    free: string;
  } | null>(null);
  const [deviceRam, setDeviceRam] = useState<{
    total: string;
    available: string;
  } | null>(null);
  const [deviceNetwork, setDeviceNetwork] = useState<{
    type: string;
    ip: string;
  } | null>(null);
useEffect(() => {
  const cleanup = window.phoneDock.onMirrorClosed(async (code) => {
    console.log("PhoneDock mirror closed:", code);

    setMirrorStarting(false);

    try {
      const result = await window.phoneDock.getAdbDevices();

      const currentDeviceStillConnected =
        result.success &&
        result.devices.some(
          (device) =>
            device.id === deviceId &&
            device.status === "device"
        );

      if (currentDeviceStillConnected) {
        setMirrorStatus("Mirror disconnected");
      } else {
        setDeviceId("");
        setActiveConnection(null);
        setConnectionAddress("");
        setSelectedDeviceId("");
        setDeviceStatus("No phone connected");
        setDeviceModel("");
        setDeviceManufacturer("");
        setAndroidVersion("");
        setBattery("");
        setMirrorStatus("Ready");
        setDeviceStorage(null);
        setDeviceNetwork(null);
        setDeviceRam(null);
        setCharging(false);
      }
    } catch (error) {
      console.error("Failed to verify device after mirror close:", error);

      setMirrorStatus("Mirror disconnected");
    }
  });

  return cleanup;
}, [deviceId]);
useEffect(() => {
  if (!deviceId) {
    setConnectionHealth("checking");
    return;
  }

  let cancelled = false;

  const checkConnection = async () => {
    try {
      const result = await window.phoneDock.getAdbDevices();

      if (cancelled) return;

      const device = result.devices.find(
        (item) => item.id === deviceId
      );

      if (
        result.success &&
        device &&
        device.status === "device"
      ) {
        setConnectionHealth("connected");
      } else {
        setConnectionHealth("offline");
      }
    } catch (error) {
      if (!cancelled) {
        console.error(
          "Connection health check failed:",
          error
        );

        setConnectionHealth("offline");
      }
    }
  };

  checkConnection();

  const interval = setInterval(
    checkConnection,
    3000
  );

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, [deviceId]);
  const disconnectDevice = async () => {
   const result =
    await window.phoneDock.closePhoneMirror();

    console.log(
      "Mirror closed:",
      result
    );

    setDeviceId("");
    setActiveConnection(null);
    setConnectionAddress("");
    setSelectedDeviceId("");
    setDeviceStatus("No phone connected");
    setDeviceModel("");
    setDeviceManufacturer("");
    setAndroidVersion("");
    setBattery("");
    setCharging(false);
    setDeviceStorage(null);
    setDeviceRam(null);
    setMirrorStarting(false);
    setMirrorStatus("Ready");
    setDeviceNetwork(null);

  };
  const switchDevice = async () => {
    // Close the current mirror first
    await window.phoneDock.closePhoneMirror();

    // Return to device selection screen
    setDeviceId("");
    setActiveConnection(null);
    setConnectionAddress("");
    setDeviceModel("");
    setDeviceManufacturer("");
    setAndroidVersion("");
    setBattery("");
    setCharging(false);
    setDeviceStorage(null);
    setDeviceRam(null);
    setDeviceNetwork(null);
    setMirrorStarting(false);
    setMirrorStatus("Ready");
    setDeviceStatus("Select a device");
  };
  useEffect(() => {
  if (!deviceId) return;

  const updateBounds = async () => {
    const stage =
      document.querySelector(
        ".mirror-stage"
      ) as HTMLElement | null;

    if (!stage) return;

    const rect = stage.getBoundingClientRect();

    await window.phoneDock.updateMirrorBounds({
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });
  };

  const timeout = setTimeout(updateBounds, 100);

  return () => clearTimeout(timeout);
}, [mirrorFullscreen, deviceId]);

  const scanForPhone = async () => {
    setScanning(true);
    setDeviceStatus("Scanning...");

    try {
      const result =
        await window.phoneDock.scanPhone();

      if (
        result.success &&
        result.devices.length > 0
      ) {
        setAvailableDevices(result.devices);
        const device =
          result.devices.find(
            (item) => item.status === "device"
          ) ?? result.devices[0];

        if (device.status === "device") {
           setDeviceStatus("Phone detected");

          setDeviceModel(
            device.model ?? "Android device"
          );

          setDeviceManufacturer(
            device.manufacturer ?? ""
          );

          setSelectedDeviceId(device.id); 

          setAndroidVersion(
            device.androidVersion ?? ""
          );

          setBattery(
            device.battery ?? ""
          );
          setCharging(device.charging ?? false);
          setDeviceStorage(device.storage ?? null);
          setDeviceRam(device.ram ?? null);
          setCharging(device.charging ?? false);
          setDeviceNetwork(device.network ?? null);
        } else {
          setDeviceStatus(
            `Phone ${device.status}`
          );
        }
      } else if (result.success) {
        setDeviceStatus(
          "No phone connected"
        );
        setAvailableDevices([]);
        setDeviceModel("");
        setDeviceManufacturer("");
        setDeviceId("");
        setAndroidVersion("");
        setBattery("");
        setDeviceStorage(null);
        setDeviceRam(null);
        setSelectedDeviceId("");
        setDeviceNetwork(null);
      } else {
        setDeviceStatus("ADB error");
        console.error(result.error);
      }
    } catch (error) {
      console.error(error);
      setDeviceStatus("Scan failed");
    } finally {
      setScanning(false);
    }
  };
    const reconnectDevice = async () => {
      setDeviceStatus("Reconnecting...");
      setConnectionHealth("checking");

      await scanForPhone();
    };

    const openMirror = async () => {
      if (
        !deviceId ||
        connectionHealth !== "connected"
      ) {
        setMirrorStatus("Phone is offline");
        return;
      }

  if (!deviceId || mirrorStarting) return;

  setMirrorStarting(true);

  setMirrorStatus(
    mirrorStatus === "Refreshing mirror..."
      ? "Refreshing mirror..."
      : connectionMode === "wifi"
        ? "Connecting via Wi-Fi..."
        : connectionMode === "auto"
          ? "Detecting connection..."
          : "Connecting via USB..."
  );

      let activeDeviceId = deviceId;

        // USB mode
      if (connectionMode === "usb") {
          console.log(
            "Connection mode: USB"
          );

          setActiveConnection("usb");
          setConnectionAddress("");
          
        }

        // Wi-Fi mode
        if (connectionMode === "wifi") {
          console.log(
            "Connection mode: Wi-Fi"
          );

          const wifiResult =
            await window.phoneDock.enableWifiAdb(
              deviceId
            );

          console.log(
            "Wi-Fi ADB result:",
            wifiResult
          );

          if (
            !wifiResult.success ||
            !wifiResult.deviceId
          ) {
            console.error(
              "Wi-Fi connection failed:",
              wifiResult.error
            );

            setMirrorStatus("Wi-Fi connection failed");
            setMirrorStarting(false);

            return;
          }

          activeDeviceId =
            wifiResult.deviceId;
          setActiveConnection("wifi");
          setConnectionAddress(wifiResult.deviceId);
          console.log(
            "Using Wi-Fi device:",
            activeDeviceId
          );
        }

        // Auto mode
        if (connectionMode === "auto") {
          console.log("Connection mode: Auto");

          const adbResult =
            await window.phoneDock.getAdbDevices();

          console.log(
            "Available ADB devices:",
            adbResult
          );

          if (adbResult.success) {
            const wifiDevice = adbResult.devices.find(
              (device) =>
                device.status === "device" &&
                device.type === "wifi"
            );

            if (wifiDevice) {
              console.log(
                "Auto: Existing Wi-Fi device found:",
                wifiDevice.id
              );

              activeDeviceId = wifiDevice.id;
              setActiveConnection("wifi");
              setConnectionAddress(wifiDevice.id);
            } else {
              console.log(
                "Auto: No Wi-Fi device found, using USB"
              );

              activeDeviceId = deviceId;
              setActiveConnection("usb");
              setConnectionAddress("");
            }
          } else {
            console.log(
              "Auto: ADB device check failed, using USB"
            );

            activeDeviceId = deviceId;
            setActiveConnection("usb");
            setConnectionAddress("");
          }
        }

        console.log(
          "Launching mirror with:",
          activeDeviceId
        );

        const result =
          await window.phoneDock.mirrorPhone(
            activeDeviceId,
            mirrorSettings
          );
      if (!result.success) {
        console.error(result.error);
        setMirrorStatus("Mirror failed");
        setMirrorStarting(false);
        return;
      }

        console.log("Mirror launched");
        setMirrorStatus("Starting mirror...");

        setTimeout(async () => {
          const handle =
            await window.phoneDock.getPhoneMirrorWindow();

          console.log(
            "PhoneDock Mirror HWND:",
            handle
          );

          const embedResult =
            await window.phoneDock.embedPhoneMirror(
              handle
            );

          console.log(
            "Embed result:",
            embedResult
          );

        if (!embedResult.success) {
          setMirrorStatus("Mirror failed");
          setMirrorStarting(false);
          return;
        }

        setMirrorStatus("Live");
        setMirrorStarting(false);

          const stage =
            document.querySelector(
              ".mirror-stage"
            ) as HTMLElement | null;

          if (!stage) {
            console.error(
              "Mirror stage not found"
            );
            return;
          }

          const rect =
            stage.getBoundingClientRect();

          const trackingResult =
            await window.phoneDock.startMirrorTracking(
              handle,
              {
                x: Math.round(rect.left),
                y: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              }
            );

          console.log(
            "Native tracking:",
            trackingResult
          );
        }, 100);
      };
    const refreshMirror = async () => {
      setMirrorStarting(false);
      setMirrorStatus("Refreshing mirror...");

      await window.phoneDock.closePhoneMirror();

      setTimeout(() => {
        openMirror();
      }, 300);
    };
    const goHome = async () => {
      if (
        !deviceId ||
        connectionHealth !== "connected"
      ) {
        return;
      }

      const result = await window.phoneDock.phoneHome(deviceId);

      console.log("Home result:", result);
    };
        const focusPhoneDock = async () => {
          const result = await window.phoneDock.focusPhoneMirror();

          console.log("Keyboard focus:", result);
        };
        const takeScreenshot = async () => {
          if (!deviceId) return;

          const result =
            await window.phoneDock.takeScreenshot(deviceId);

          console.log("Screenshot result:", result);
        };
        const toggleMirrorFullscreen = () => {
          setMirrorFullscreen((prev) => !prev);
    };
    const goBack = async () => {
      if (
        !deviceId ||
        connectionHealth !== "connected"
      ) {
        return;
      }

      const result = await window.phoneDock.phoneBack(deviceId);

      console.log("Back result:", result);
    };
    const goRecent = async () => {
      if (
        !deviceId ||
        connectionHealth !== "connected"
      ) {
        return;
      }

      const result = await window.phoneDock.phoneRecent(deviceId);

      console.log("Recent Apps result:", result);
    };
    const goVolumeUp = async () => {
      if (
        !deviceId ||
        connectionHealth !== "connected"
      ) {
        return;
      }

      const result =
        await window.phoneDock.phoneVolumeUp(deviceId);

      console.log("Volume Up result:", result);
    };
    const goVolumeDown = async () => {
      if (
          !deviceId ||
          connectionHealth !== "connected"
        ) {
          return;
        }

        const result =
          await window.phoneDock.phoneVolumeDown(deviceId);

        console.log("Volume Down result:", result);
    };
    const goMute = async () => {
      if (
        !deviceId ||
        connectionHealth !== "connected"
      ) {
        return;
      }

      const result =
        await window.phoneDock.phoneMute(deviceId);

      console.log("Mute result:", result);
    };
    const goLock = async () => {
      if (
        !deviceId ||
        connectionHealth !== "connected"
      ) {
        return;
      }

      const result =
        await window.phoneDock.phoneLock(deviceId);

      console.log("Lock result:", result);
    };
    const phoneActionHandlers: PhoneActionHandlers = {
      HOME: goHome,
      BACK: goBack,
      RECENT: goRecent,
      VOLUME_UP: goVolumeUp,
      VOLUME_DOWN: goVolumeDown,
      MUTE: goMute,
      LOCK: goLock,
    };
const runPhoneCommand = async (command: string) => {
  if (!command.trim()) return;

  console.log("PhoneDock command:", command);

  setAiStatus("processing");

  const result = await providerManager.parseCommand(command);

  console.log(
    "PhoneDock provider result:",
    result
  );

 if (!result.success || !result.actions) {
  setAiStatus("local");

  setAiMessage(
    result.error ?? "I couldn't understand that command."
  );

  console.log(
    "PhoneDock could not understand the command:",
    result.error
  );

  return;
}

  setAiStatus(
    result.provider === "cloud"
      ? "cloud"
      : "local"
  );

  const safeActions = validateAIResult(
    result.actions
  );

if (safeActions.length === 0) {
  setAiMessage(
    "I don't know how to do that yet."
  );

  console.log(
    "No allowed PhoneDock actions found."
  );

  return;
}

  console.log(
    "PhoneDock safe actions:",
    safeActions
  );

  await executeActions(
    safeActions,
    phoneActionHandlers
  );


  setAiMessage(
    `Done — ${safeActions.join(" + ")}`
  );
};
  return (
    <div className="app">

      {/* TOPBAR */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            ⌁
          </div>

          <div>
            <h1>PhoneDock</h1>

            <span>
              Android control station
            </span>
          </div>

        </div>

        <div className="version">
          Engine {engineVersion} • Prototype
        </div>

      </header>


      {/* MAIN */}

      <main className="main">

        {!deviceId ? (

          /* =========================
             DISCONNECTED
          ========================= */

          <>
            <section className="hero">

              <div className="eyebrow">

                <span className="status-dot" />

                SYSTEM READY

              </div>

              <h2>
                Your phone.
                <br />

                <span>
                  Right here.
                </span>
              </h2>

              <p>
                Connect an Android phone and
                turn this PC into your temporary
                phone station.
              </p>

            </section>


            <section className="device-card">

              <div className="device-visual">

                <div className="phone-icon">

                  <div className="phone-screen">

                    <div className="screen-dot" />

                    <div className="screen-line" />

                    <div className="screen-line short" />

                  </div>

                </div>

              </div>


              <div className="device-info">

                <span className="device-label">
                  DEVICE STATUS
                </span>

                <h3>
                  {deviceStatus}
                </h3>

                <p>
                  Connect an Android phone through
                  USB and PhoneDock will detect it
                  automatically.
                </p>


                <button
                  className="connect-button"
                  disabled={scanning}
                  onClick={scanForPhone}
                >

                  <span>
                    ⌁
                  </span>

                  {scanning
                    ? "Scanning..."
                    : "Scan for phone"}

                </button>

              </div>

            </section>
          {availableDevices.length > 0 && (
              <section className="device-list">
                <div className="device-list-header">
                  <div>
                    <span className="device-label">
                      AVAILABLE DEVICES
                    </span>

                    <h3>
                      {availableDevices.length} devices detected
                    </h3>
                  </div>
                </div>

                <div className="device-list-items">
                  {availableDevices.map((device) => (
                    <button
                      key={device.id}
                      className={`device-list-item ${
                        device.id === selectedDeviceId ? "selected" : ""
                      }`}
                    onClick={() => {
                        if (device.status !== "device") return;

                        setSelectedDeviceId(device.id);

                        setDeviceModel(
                          device.model ?? "Android device"
                        );

                        setDeviceManufacturer(
                          device.manufacturer ?? ""
                        );

                        setAndroidVersion(
                          device.androidVersion ?? ""
                        );

                        setBattery(
                          device.battery ?? ""
                        );
                        setDeviceStorage(device.storage ?? null);
                        setDeviceRam(device.ram ?? null);
                        setDeviceNetwork(device.network ?? null);
                      }}
                      disabled={device.status !== "device"}
                    >
                      <div className="device-list-icon">
                        📱
                      </div>

                      <div className="device-list-info">
                        <strong>
                          {device.model ?? "Android device"}
                        </strong>

                        <span>
                          {device.manufacturer ?? "Unknown manufacturer"}
                          {" • "}
                          {device.status}
                        </span>
                      </div>

                      {device.id === selectedDeviceId && (
                        <span className="device-selected">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedDeviceId && (
                    <button
                      className="connect-selected-button"
                      onClick={() => {
                        setDeviceId(selectedDeviceId);
                        setDeviceStatus("Phone connected");
                      }}
                    >
                      Connect selected device
                    </button>
                  )}
              </section>
            )}
            <section className="status-grid">

              <div className="status-item">

                <span className="status-indicator ready" />

                <div>
                  <small>
                    APP ENGINE
                  </small>

                  <strong>
                    Ready
                  </strong>
                </div>

              </div>


              <div className="status-item">

                <span className="status-indicator ready" />

                <div>
                  <small>
                    PHONE ENGINE
                  </small>

                  <strong>
                    Ready
                  </strong>
                </div>

              </div>


              <div className="status-item">

                <span className="status-indicator waiting" />

                <div>
                  <small>
                    DEVICE
                  </small>

                  <strong>
                    Waiting
                  </strong>
                </div>

              </div>

            </section>
          </>

        ) : (

          /* =========================
             CONNECTED WORKSPACE
          ========================= */

          <>

            <DeviceHeader
              model={deviceModel}
              manufacturer={deviceManufacturer}
              androidVersion={androidVersion}
              battery={battery}
              connectionMode={connectionMode}
              onConnectionModeChange={setConnectionMode}
              onDisconnect={disconnectDevice}
              activeConnection={activeConnection}
              connectionAddress={connectionAddress}
              onSwitchDevice={switchDevice}
              connectionHealth={connectionHealth}
              onReconnect={reconnectDevice}
              charging={charging}
            />
            <PhoneDashboard
              model={deviceModel}
              manufacturer={deviceManufacturer}
              androidVersion={androidVersion}
              battery={battery}
              charging={charging}
              storage={deviceStorage}
              ram={deviceRam}
              network={deviceNetwork}
              connectionHealth={connectionHealth}
                connectionType={
                  activeConnection ??
                  (connectionMode === "usb"
                    ? "usb"
                    : connectionMode === "wifi"
                      ? "wifi"
                      : null)
                }
              connectionAddress={connectionAddress}
              onHome={goHome}
              onBack={goBack}
              onRecent={goRecent}
              onVolumeUp={goVolumeUp}
              onVolumeDown={goVolumeDown}
              onMute={goMute}
              onLock={goLock}
            />
            <section className="phone-ai-bar">
              <div className="phone-ai-label">
                <span>⌁</span>

                <div>
                  <strong>PhoneDock AI</strong>
                  <small>Control your phone with commands</small>
                </div>

                <div className={`ai-status ${aiStatus}`}>
                  <span className="ai-status-dot" />

                  {aiStatus === "processing"
                    ? "Processing"
                    : aiStatus === "cloud"
                      ? "Cloud AI"
                      : "Local mode"}
                </div>
              </div>
              {aiMessage && (
                <div className="ai-message">
                  {aiMessage}
                </div>
              )}
              <div className="phone-ai-input-row">
                <input
                  type="text"
                  value={phoneCommand}
                  onChange={(e) => setPhoneCommand(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && phoneCommand.trim()) {
                      runPhoneCommand(phoneCommand);
                      setPhoneCommand("");
                    }
                  }}
                  placeholder='Try "go home" or "turn volume up"...'
                />

                <button
                  onClick={() => {
                    if (!phoneCommand.trim()) return;

                    runPhoneCommand(phoneCommand);
                    setPhoneCommand("");
                  }}
                  disabled={
                    !phoneCommand.trim() ||
                    connectionHealth !== "connected"
                  }
                >
                  Execute
                </button>
              </div>
            </section>
           <MirrorWorkspace
              onMirror={openMirror}
              onRefresh={refreshMirror}
              onKeyboard={focusPhoneDock}
              onScreenshot={takeScreenshot}
              onFullscreen={toggleMirrorFullscreen}
              isFullscreen={mirrorFullscreen}
              mirrorStarting={mirrorStarting}
              onMirrorSettingsChange={setMirrorSettings}
              mirrorStatus={mirrorStatus}
              connectionHealth={connectionHealth}
              onHome={goHome}
              onBack={goBack}
              onRecent={goRecent}
              onVolumeUp={goVolumeUp}
              onVolumeDown={goVolumeDown}
              onMute={goMute}
              onLock={goLock}
            />

          </>

        )}

      </main>


      {/* FOOTER */}

      <footer>

        <span>
          PHONE → PC
        </span>

        <span>
          USB / WI-FI
        </span>

        <span>
          ANDROID
        </span>

      </footer>

    </div>
  );
}

export default App;