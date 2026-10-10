import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("phoneDock", {
  version: "0.1.0",

  scanPhone: () => {
    return ipcRenderer.invoke("scan-phone");
  },
  enableWifiAdb: (deviceId: string) =>
    ipcRenderer.invoke("enable-wifi-adb", deviceId),
  mirrorPhone: (
    deviceId: string,
    settings: {
      quality: "performance" | "balanced" | "quality";
      fps: string;
      resolution: string;
      bitrate: string;
    }
  ) => {
    return ipcRenderer.invoke(
      "mirror-phone",
      deviceId,
      settings
    );
  },

  getPhoneMirrorWindow: () => {
    return ipcRenderer.invoke("get-phone-mirror-window");
  },
  embedPhoneMirror: (mirrorHwnd: string) => {

    return ipcRenderer.invoke(
      "embed-phone-mirror",
      mirrorHwnd
    );

  },
  positionPhoneMirror: (bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => {
      return ipcRenderer.invoke(
        "position-phone-mirror",
        bounds
      );
    },
    startMirrorTracking: (
    mirrorHwnd: string,
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) => {

    return ipcRenderer.invoke(
      "start-mirror-tracking",
      mirrorHwnd,
      bounds
    );

  },

  stopMirrorTracking: () => {
    return ipcRenderer.invoke(
      "stop-mirror-tracking"
    );
  },
  closePhoneMirror: () => {
    return ipcRenderer.invoke(
      "close-phone-mirror"
    );
  },
  focusPhoneMirror: () =>
    ipcRenderer.invoke("focus-phone-mirror"),
  takeScreenshot: (deviceId: string) =>
  ipcRenderer.invoke("take-screenshot", deviceId),
  updateMirrorBounds: (bounds: {
  x: number;
  y: number;
  width: number;
  height: number;
}) =>
  ipcRenderer.invoke("update-mirror-bounds", bounds), 
  onMirrorClosed: (callback: (code: number | null) => void) => {
  const listener = (
    _event: Electron.IpcRendererEvent,
    code: number | null
  ) => {
    callback(code);
  };

  ipcRenderer.on("mirror-closed", listener);

  return () => {
    ipcRenderer.removeListener("mirror-closed", listener);
  };
},
  getAdbDevices: () => {
    return ipcRenderer.invoke("get-adb-devices");
  },
  phoneHome: (deviceId: string) =>
    ipcRenderer.invoke("phone-home", deviceId),
  phoneBack: (deviceId: string) =>
    ipcRenderer.invoke("phone-back", deviceId),
  phoneRecent: (deviceId: string) =>
    ipcRenderer.invoke("phone-recent", deviceId),
  phoneVolumeUp: (deviceId: string) =>
    ipcRenderer.invoke("phone-volume-up", deviceId),
  phoneVolumeDown: (deviceId: string) =>
    ipcRenderer.invoke("phone-volume-down", deviceId),
  phoneMute: (deviceId: string) =>
    ipcRenderer.invoke("phone-mute", deviceId),
  phoneLock: (deviceId: string) =>
    ipcRenderer.invoke("phone-lock", deviceId),
  askAI: (command: string) =>
    ipcRenderer.invoke("ai-phone-command", command),
});