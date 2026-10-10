import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import { exec, execFile } from 'node:child_process'
import { spawn } from 'node:child_process'
import "dotenv/config";
import { askPhoneDockAI } from "./aiService";
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')
const getEnginePath = (...segments: string[]) => {
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, "engine")
    : path.resolve(process.env.APP_ROOT!, "..", "engine");

  return path.join(basePath, ...segments);
};


const getAdbPath = () =>
  getEnginePath("scrcpy-win64-v4.1", "adb.exe");

const getScrcpyPath = () =>
  getEnginePath("scrcpy-win64-v4.1", "scrcpy.exe");


// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let mirrorTracker: ReturnType<typeof setInterval> | null = null;
let mirrorBounds = {
  x: 0,
  y: 0,
  width: 320,
  height: 650,
};
let mirrorProcess: ReturnType<typeof spawn> | null = null;
ipcMain.handle("scan-phone", async () => {
  const adbPath = getAdbPath();

  const runAdb = (args: string[]) =>
    new Promise<string>((resolve, reject) => {
      execFile(adbPath, args, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }

        resolve(stdout.trim());
      });
    });

  try {
    const output = await runAdb(["devices"]);

    const devices = output
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.trim())
      .filter((line) => line && line.includes("\t"))
      .map((line) => {
        const [id, status] = line.split("\t");

        return {
          id,
          status,
        };
      });

    if (devices.length === 0) {
      return {
        success: true,
        devices: [],
      };
    }

    const connectedDevices = [];

    for (const device of devices) {
      if (device.status !== "device") {
        connectedDevices.push(device);
        continue;
      }

      let model = "Android device";
      let manufacturer = "Unknown";
      let androidVersion = "Unknown";
      let battery = "Unknown";
      let charging = false;
      let storage = {
        total: "Unknown",
        used: "Unknown",
        free: "Unknown",
      };
      let ram = {
        total: "Unknown",
        available: "Unknown",
      };
      let network = {
        type: "Unknown",
        ip: "Unknown",
      };
      try {
        model = await runAdb([
          "-s",
          device.id,
          "shell",
          "getprop",
          "ro.product.model",
        ]);
      } catch {
        // Keep default model
      }

      try {
        manufacturer = await runAdb([
          "-s",
          device.id,
          "shell",
          "getprop",
          "ro.product.manufacturer",
        ]);
      } catch {
        // Keep default manufacturer
      }
      try {
        androidVersion = await runAdb([
          "-s",
          device.id,
          "shell",
          "getprop",
          "ro.build.version.release",
        ]);
      } catch {
        // Keep default Android version
      }

      try {
          const batteryOutput = await runAdb([
            "-s",
            device.id,
            "shell",
            "dumpsys",
            "battery",
          ]);

          const levelMatch = batteryOutput.match(
            /level:\s*(\d+)/
          );

          const chargingMatch = batteryOutput.match(
            /AC powered:\s*(true|false)|USB powered:\s*(true|false)|Wireless powered:\s*(true|false)/i
          );

          if (levelMatch) {
            battery = `${levelMatch[1]}%`;
          }

          charging = Boolean(
            chargingMatch &&
            chargingMatch[0].toLowerCase().includes("true")
          );
        } catch {
          // Keep default battery
        }
      try {
        const storageOutput = await runAdb([
          "-s",
          device.id,
          "shell",
          "df",
          "/data",
        ]);

        const lines = storageOutput
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length >= 2) {
          const parts = lines[1].split(/\s+/);

          if (parts.length >= 4) {
            storage = {
              total: parts[1],
              used: parts[2],
              free: parts[3],
            };
          }
        }
      } catch {
        // Keep default storage
      }
      try {
          const ramOutput = await runAdb([
            "-s",
            device.id,
            "shell",
            "cat",
            "/proc/meminfo",
          ]);

          const totalMatch = ramOutput.match(
            /MemTotal:\s+(\d+)\s+kB/i
          );

          const availableMatch = ramOutput.match(
            /MemAvailable:\s+(\d+)\s+kB/i
          );

          if (totalMatch && availableMatch) {
            ram = {
              total: totalMatch[1],
              available: availableMatch[1],
            };
          }
        } catch {
          // Keep default RAM
        }
        try {
          const routeOutput = await runAdb([
            "-s",
            device.id,
            "shell",
            "ip",
            "route",
          ]);

          const ipOutput = await runAdb([
            "-s",
            device.id,
            "shell",
            "ip",
            "-f",
            "inet",
            "addr",
            "show",
            "wlan0",
          ]);

          const routeMatch = routeOutput.match(
            /dev\s+(\S+)/
          );

          const ipMatch = ipOutput.match(
            /inet\s+(\d+\.\d+\.\d+\.\d+)/
          );

          const interfaceName = routeMatch?.[1] ?? "";

          network = {
            type:
              interfaceName === "wlan0"
                ? "Wi-Fi"
                : interfaceName || "Unknown",
            ip: ipMatch?.[1] ?? "Unknown",
          };
        } catch {
          // Keep default network
        }
      connectedDevices.push({
        ...device,
        model,
        manufacturer,
        androidVersion,
        battery,
        storage,
        ram,
        network,
        charging,
      });
    }

    return {
      success: true,
      devices: connectedDevices,
    };
  } catch (error) {
    console.error("ADB ERROR:", error);

    return {
      success: false,
      devices: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
});
ipcMain.handle("get-adb-devices", async () => {
const adbPath = getAdbPath();

  return new Promise((resolve) => {
    execFile(
      adbPath,
      ["devices"],
      (error, stdout, stderr) => {
        if (error) {
          console.error(
            "ADB DEVICE CHECK ERROR:",
            stderr || error.message
          );

          resolve({
            success: false,
            devices: [],
            error: stderr || error.message,
          });

          return;
        }

        const devices = stdout
          .split(/\r?\n/)
          .slice(1)
          .map((line) => line.trim())
          .filter(
            (line) =>
              line &&
              line.includes("\t")
          )
          .map((line) => {
            const [id, status] =
              line.split("\t");

            return {
              id,
              status,
              type: id.includes(":")
                ? "wifi"
                : "usb",
            };
          });

        console.log(
          "AVAILABLE ADB DEVICES:",
          devices
        );

        resolve({
          success: true,
          devices,
        });
      }
    );
  });
});
ipcMain.handle(
  "phone-home",
  async (_event, deviceId: string) => {
    if (!deviceId) {
      return {
        success: false,
        error: "No device connected",
      };
    }

   const adbPath = getAdbPath();

    return new Promise((resolve) => {
      execFile(
        adbPath,
        [
          "-s",
          deviceId,
          "shell",
          "input",
          "keyevent",
          "KEYCODE_HOME",
        ],
        (error, _stdout, stderr) => {
          if (error) {
            console.error(
              "HOME BUTTON ERROR:",
              stderr || error.message
            );

            resolve({
              success: false,
              error: stderr || error.message,
            });

            return;
          }

          console.log("PHONE HOME ACTION SENT");

          resolve({
            success: true,
          });
        }
      );
    });
  }
);
ipcMain.handle(
  "phone-back",
  async (_event, deviceId: string) => {
    if (!deviceId) {
      return {
        success: false,
        error: "No device connected",
      };
    }

   const adbPath = getAdbPath();

    return new Promise((resolve) => {
      execFile(
        adbPath,
        [
          "-s",
          deviceId,
          "shell",
          "input",
          "keyevent",
          "KEYCODE_BACK",
        ],
        (error, _stdout, stderr) => {
          if (error) {
            console.error(
              "BACK BUTTON ERROR:",
              stderr || error.message
            );

            resolve({
              success: false,
              error: stderr || error.message,
            });

            return;
          }

          console.log("PHONE BACK ACTION SENT");

          resolve({
            success: true,
          });
        }
      );
    });
  }
);
ipcMain.handle(
  "phone-recent",
  async (_event, deviceId: string) => {
    if (!deviceId) {
      return {
        success: false,
        error: "No device connected",
      };
    }

const adbPath = getAdbPath();

    return new Promise((resolve) => {
      execFile(
        adbPath,
        [
          "-s",
          deviceId,
          "shell",
          "input",
          "keyevent",
          "KEYCODE_APP_SWITCH",
        ],
        (error, _stdout, stderr) => {
          if (error) {
            console.error(
              "RECENT APPS ERROR:",
              stderr || error.message
            );

            resolve({
              success: false,
              error: stderr || error.message,
            });

            return;
          }

          console.log("PHONE RECENT APPS ACTION SENT");

          resolve({
            success: true,
          });
        }
      );
    });
  }
);
ipcMain.handle(
  "phone-volume-up",
  async (_event, deviceId: string) => {
    if (!deviceId) {
      return {
        success: false,
        error: "No device connected",
      };
    }

    const adbPath = getAdbPath();

    return new Promise((resolve) => {
      execFile(
        adbPath,
        [
          "-s",
          deviceId,
          "shell",
          "input",
          "keyevent",
          "KEYCODE_VOLUME_UP",
        ],
        (error, _stdout, stderr) => {
          if (error) {
            console.error(
              "VOLUME UP ERROR:",
              stderr || error.message
            );

            resolve({
              success: false,
              error: stderr || error.message,
            });

            return;
          }

          console.log("PHONE VOLUME UP ACTION SENT");

          resolve({
            success: true,
          });
        }
      );
    });
  }
); 
ipcMain.handle(
  "phone-volume-down",
  async (_event, deviceId: string) => {
    if (!deviceId) {
      return {
        success: false,
        error: "No device connected",
      };
    }

    const adbPath = getAdbPath();

    return new Promise((resolve) => {
      execFile(
        adbPath,
        [
          "-s",
          deviceId,
          "shell",
          "input",
          "keyevent",
          "KEYCODE_VOLUME_DOWN",
        ],
        (error, _stdout, stderr) => {
          if (error) {
            console.error(
              "VOLUME DOWN ERROR:",
              stderr || error.message
            );

            resolve({
              success: false,
              error: stderr || error.message,
            });

            return;
          }

          console.log("PHONE VOLUME DOWN ACTION SENT");

          resolve({
            success: true,
          });
        }
      );
    });
  }
);
ipcMain.handle(
  "phone-mute",
  async (_event, deviceId: string) => {
    if (!deviceId) {
      return {
        success: false,
        error: "No device connected",
      };
    }

    const adbPath = getAdbPath();

    return new Promise((resolve) => {
      execFile(
        adbPath,
        [
          "-s",
          deviceId,
          "shell",
          "input",
          "keyevent",
          "KEYCODE_MUTE",
        ],
        (error, _stdout, stderr) => {
          if (error) {
            console.error(
              "MUTE ERROR:",
              stderr || error.message
            );

            resolve({
              success: false,
              error: stderr || error.message,
            });

            return;
          }

          console.log("PHONE MUTE ACTION SENT");

          resolve({
            success: true,
          });
        }
      );
    });
  }
);
ipcMain.handle(
  "phone-lock",
  async (_event, deviceId: string) => {
    if (!deviceId) {
      return {
        success: false,
        error: "No device connected",
      };
    }

    const adbPath = getAdbPath();

    return new Promise((resolve) => {
      execFile(
        adbPath,
        [
          "-s",
          deviceId,
          "shell",
          "input",
          "keyevent",
          "KEYCODE_POWER",
        ],
        (error, _stdout, stderr) => {
          if (error) {
            console.error(
              "LOCK ERROR:",
              stderr || error.message
            );

            resolve({
              success: false,
              error: stderr || error.message,
            });

            return;
          }

          console.log("PHONE LOCK ACTION SENT");

          resolve({
            success: true,
          });
        }
      );
    });
  }
);
ipcMain.handle(
  "enable-wifi-adb",
  async (_event, deviceId: string) => {
    if (!deviceId) {
      return {
        success: false,
        error: "No device connected",
      };
    }

    const adbPath = getAdbPath();

    const runAdb = (args: string[]) =>
      new Promise<string>((resolve, reject) => {
        execFile(
          adbPath,
          args,
          (error, stdout, stderr) => {
            if (error) {
              reject(
                new Error(
                  stderr?.toString() ||
                    error.message
                )
              );
              return;
            }

            resolve(stdout.trim());
          }
        );
      });

    try {
      console.log(
        "Getting Wi-Fi IP for:",
        deviceId
      );

      // Get the phone's Wi-Fi IP address
      const routeOutput = await runAdb([
        "-s",
        deviceId,
        "shell",
        "ip",
        "route",
      ]);

      const ipMatch = routeOutput.match(
        /src\s+(\d+\.\d+\.\d+\.\d+)/
      );

      if (!ipMatch) {
        return {
          success: false,
          error:
            "Could not determine phone Wi-Fi IP address",
        };
      }

      const ipAddress = ipMatch[1];

      console.log(
        "Phone Wi-Fi IP:",
        ipAddress
      );

      // Switch ADB to TCP/IP mode
      await runAdb([
        "-s",
        deviceId,
        "tcpip",
        "5555",
      ]);

      console.log(
        "ADB switched to TCP/IP mode"
      );

      // Connect through Wi-Fi
      const connectOutput = await runAdb([
        "connect",
        `${ipAddress}:5555`,
      ]);

      console.log(
        "ADB Wi-Fi connection:",
        connectOutput
      );

      return {
        success: true,
        ipAddress,
        deviceId: `${ipAddress}:5555`,
        message: connectOutput,
      };
    } catch (error) {
      console.error(
        "WI-FI ADB ERROR:",
        error
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }
);
  ipcMain.handle(
    "mirror-phone",
    async (
      _event,
      deviceId: string,
      settings: {
        quality: "performance" | "balanced" | "quality";
        fps: string;
        resolution: string;
        bitrate: string;
      }
    ) => {
const scrcpyPath = getScrcpyPath();

  console.log("SCRCPY PATH:", scrcpyPath);
  console.log("Starting scrcpy for:", deviceId);

mirrorProcess = spawn(
    scrcpyPath,
    [
      "-s",
      deviceId,

      "--video-codec=h264",
      `--max-size=${settings.resolution}`,
      `--video-bit-rate=${settings.bitrate}M`,
      `--max-fps=${settings.fps}`,
     "--stay-awake",
      "--window-title=PhoneDock Mirror",
      "--window-borderless",
      "--window-width=320",
      "--window-height=650",
    ],  
    {
      detached: false,
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

 mirrorProcess.stdout?.on("data", (data) => {
    console.log("SCRCPY STDOUT:", data.toString());
  });

  mirrorProcess.stderr?.on("data", (data) => {
    console.log("SCRCPY STDERR:", data.toString());
  });

  mirrorProcess.on("error", (error) => {
    console.error("SCRCPY PROCESS ERROR:", error);
  });

  mirrorProcess.on("spawn", () => {
    console.log("SCRCPY PROCESS STARTED");
  });

mirrorProcess.on("close", (code) => {
  console.log("SCRCPY CLOSED WITH CODE:", code);

  if (win && !win.isDestroyed()) {
    win.webContents.send("mirror-closed", code);
  }

  mirrorProcess = null;
});
  return {
    success: true,
  };
});
ipcMain.handle("get-phone-mirror-window", async () => {
  const findWindow = (): Promise<string> => {
    return new Promise((resolve) => {
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `
          $process = Get-Process |
            Where-Object { $_.MainWindowTitle -eq "PhoneDock Mirror" } |
            Select-Object -First 1

          if ($process) {
            $process.MainWindowHandle
          } else {
            0
          }
          `,
        ],
        (error, stdout) => {
          if (error) {
            resolve("0");
            return;
          }

          resolve(stdout.trim() || "0");
        }
      );
    });
  };

  // Check every 100ms for up to 5 seconds
  for (let attempt = 0; attempt < 50; attempt++) {
    const handle = await findWindow();

    if (handle !== "0") {
      console.log(
        `SCRCPY WINDOW FOUND (${attempt * 100}ms):`,
        handle
      );

      return handle;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 100)
    );
  }

  console.log(
    "SCRCPY WINDOW NOT FOUND AFTER 5 SECONDS"
  );

  return "0";
});
ipcMain.handle("focus-phone-mirror", async () => {
  const psCommand = `
    Add-Type @"
    using System;
    using System.Runtime.InteropServices;

    public class WinFocus {
      [DllImport("user32.dll")]
      public static extern bool SetForegroundWindow(IntPtr hWnd);

      [DllImport("user32.dll")]
      public static extern bool SetFocus(IntPtr hWnd);
    }
"@

    $process = Get-Process | Where-Object {
      $_.MainWindowTitle -eq "PhoneDock Mirror"
    } | Select-Object -First 1

    if ($process) {
      [WinFocus]::SetForegroundWindow($process.MainWindowHandle)
      [WinFocus]::SetFocus($process.MainWindowHandle)
      Write-Output "FOCUSED"
    } else {
      Write-Output "NOT_FOUND"
    }
  `;

  return new Promise((resolve) => {
    exec(
      `powershell -NoProfile -Command "${psCommand.replace(/"/g, '\\"')}"`,
      (error, stdout) => {
        if (error) {
          console.error("Focus error:", error);
          resolve("ERROR");
          return;
        }

        resolve(stdout.trim());
      }
    );
  });
});
  ipcMain.handle(
    "embed-phone-mirror",
    async (_event, mirrorHwnd: string) => {
  if (!win) {
    return {
      success: false,
      error: "PhoneDock window is not available",
    };
  }

  try {
    const parentBuffer = win.getNativeWindowHandle();

    let parentHandle: bigint;

    if (parentBuffer.length >= 8) {
      parentHandle = parentBuffer.readBigUInt64LE(0);
    } else {
      parentHandle = BigInt(parentBuffer.readUInt32LE(0));
    }

    const childHandle = mirrorHwnd;

      if (!childHandle || childHandle === "0") {
        return {
          success: false,
          error: "Invalid PhoneDock Mirror HWND",
        };
      }

    console.log("PHONE DOCK HWND:", parentHandle.toString());
    console.log("SCRCPY HWND:", childHandle);

    const script = `
Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class WindowApi {
    [DllImport("user32.dll", SetLastError=true)]
    public static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

    [DllImport("user32.dll", SetLastError=true)]
    public static extern bool MoveWindow(
        IntPtr hWnd,
        int X,
        int Y,
        int nWidth,
        int nHeight,
        bool bRepaint
    );

    [DllImport("user32.dll", SetLastError=true)]
    public static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll", SetLastError=true)]
    public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    public const int GWL_STYLE = -16;
    public const int WS_CHILD = 0x40000000;
    public const int WS_POPUP = unchecked((int)0x80000000);
}
"@

$child = [IntPtr]::new($childHandle)
$parent = [IntPtr]::new($parentHandle)

$style = [WindowApi]::GetWindowLong(
    $child,
    [WindowApi]::GWL_STYLE
)

$style = $style -band (-bnot [WindowApi]::WS_POPUP)
$style = $style -bor [WindowApi]::WS_CHILD

[WindowApi]::SetWindowLong(
    $child,
    [WindowApi]::GWL_STYLE,
    $style
)

$result = [WindowApi]::SetParent(
    $child,
    $parent
)

if ($result -eq [IntPtr]::Zero) {
    $errorCode = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
    Write-Output "ERROR:$errorCode"
    exit
}

[WindowApi]::MoveWindow(
    $child,
    0,
    0,
    320,
    650,
    $true
)

Write-Output "EMBEDDED"
`;

    return await new Promise((resolve) => {
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `$parentHandle = ${parentHandle.toString()}; $childHandle = ${childHandle}; ${script}`,
        ],
        (error, stdout, stderr) => {
          if (error) {
            console.error("EMBED ERROR:", error);
            console.error("EMBED STDERR:", stderr);

            resolve({
              success: false,
              error: stderr || error.message,
            });

            return;
          }

          console.log("EMBED RESULT:", stdout.trim());

          resolve({
            success: stdout.includes("EMBEDDED"),
            error: stdout.includes("ERROR:")
              ? stdout.trim()
              : undefined,
          });
        }
      );
    });
  } catch (error) {
    console.error("EMBED ERROR:", error);

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : String(error),
    };
  }
});
ipcMain.handle(
  "position-phone-mirror",
  async (
    _event,
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) => {
    if (!win) {
      return {
        success: false,
        error: "PhoneDock window not available",
      };
    }

    return new Promise((resolve) => {
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `
          $process = Get-Process |
            Where-Object {
              $_.MainWindowTitle -eq "PhoneDock Mirror"
            } |
            Select-Object -First 1

          if (-not $process) {
            Write-Output "ERROR:WINDOW_NOT_FOUND"
            exit
          }

          $scrcpyHwnd = $process.MainWindowHandle

          Add-Type @"
          using System;
          using System.Runtime.InteropServices;

          public static class WindowApi {

              [DllImport("user32.dll", SetLastError=true)]
              public static extern bool MoveWindow(
                  IntPtr hWnd,
                  int X,
                  int Y,
                  int nWidth,
                  int nHeight,
                  bool bRepaint
              );

              [DllImport("user32.dll")]
              public static extern bool SetWindowPos(
                  IntPtr hWnd,
                  IntPtr hWndInsertAfter,
                  int X,
                  int Y,
                  int cx,
                  int cy,
                  uint uFlags
              );
          }
          "@

          $result = [WindowApi]::MoveWindow(
              [IntPtr]::new($scrcpyHwnd),
          ${Math.round(bounds.x)},
            ${Math.round(bounds.y)},
            ${Math.round(bounds.width)},
            ${Math.round(bounds.height)},
              $true
          )

          if ($result) {
              Write-Output "POSITIONED"
          } else {
              $errorCode = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
              Write-Output "ERROR:$errorCode"
          }
          `,
        ],
        (error, stdout, stderr) => {
          if (error) {
            console.error(
              "POSITION ERROR:",
              error
            );

            resolve({
              success: false,
              error:
                stderr ||
                error.message,
            });

            return;
          }

          const output = stdout.trim();

          console.log(
            "MIRROR POSITION:",
            output
          );

          resolve({
            success:
              output.includes("POSITIONED"),
            error:
              output.includes("ERROR:")
                ? output
                : undefined,
          });
        }
      );
    });
  }
);
  ipcMain.handle(
    "start-mirror-tracking",
    async (
      _event,
      mirrorHwnd: string,
      bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    ) => {
    if (!win) {
      mirrorBounds = bounds;
      return {
        success: false,
        error: "PhoneDock window not available",
      };
    }

    if (mirrorTracker) {
      clearInterval(mirrorTracker);
      mirrorTracker = null;
    }

   const hwnd = Number(mirrorHwnd);

    if (!Number.isFinite(hwnd) || hwnd === 0) {
      return {
        success: false,
        error: "Invalid PhoneDock Mirror HWND",
      };
    }
      let lastAppliedBounds = {
        x: -1,
        y: -1,
        width: -1,
        height: -1,
      };
    const moveMirror = () => {
      const nextBounds = {
          x: Math.round(mirrorBounds.x),
          y: Math.round(mirrorBounds.y),
          width: Math.round(mirrorBounds.width),
          height: Math.round(mirrorBounds.height),
        };

        if (
          nextBounds.x === lastAppliedBounds.x &&
          nextBounds.y === lastAppliedBounds.y &&
          nextBounds.width === lastAppliedBounds.width &&
          nextBounds.height === lastAppliedBounds.height
        ) {
          return;
        }

        lastAppliedBounds = nextBounds;

      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `
          Add-Type @"
          using System;
          using System.Runtime.InteropServices;

          public static class WindowApi {
              [DllImport("user32.dll", SetLastError=true)]
              public static extern bool MoveWindow(
                  IntPtr hWnd,
                  int X,
                  int Y,
                  int nWidth,
                  int nHeight,
                  bool bRepaint
              );
          }
          "@

          [WindowApi]::MoveWindow(
              [IntPtr]::new(${hwnd}),
             ${Math.round(mirrorBounds.x)},
              ${Math.round(mirrorBounds.y)},
              ${Math.round(mirrorBounds.width)},
              ${Math.round(mirrorBounds.height)},
              $true
          ) | Out-Null
          `,
        ],
        () => {}
      );
    };

    moveMirror();

    mirrorTracker = setInterval(
      moveMirror,
      100
    );

    console.log(
      "NATIVE MIRROR TRACKING STARTED:",
      hwnd
    );

    return {
      success: true,
    };
  }
);
ipcMain.handle(
  "update-mirror-bounds",
  async (
    _event,
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) => {
    mirrorBounds = bounds;

    return {
      success: true,
    };
  }
);
ipcMain.handle(
  "stop-mirror-tracking",
  async () => {
    if (mirrorTracker) {
      clearInterval(mirrorTracker);
      mirrorTracker = null;

      console.log(
        "NATIVE MIRROR TRACKING STOPPED"
      );
    }

    return {
      success: true,
    };
  }
);  
ipcMain.handle(
  "close-phone-mirror",
  async () => {
    console.log(
      "Closing PhoneDock mirror..."
    );

    // Stop native tracking
    if (mirrorTracker) {
      clearInterval(mirrorTracker);
      mirrorTracker = null;

      console.log(
        "Mirror tracking stopped"
      );
    }

    // Close scrcpy
    if (mirrorProcess) {
      try {
        mirrorProcess.kill();
        console.log(
          "Scrcpy process terminated"
        );
      } catch (error) {
        console.error(
          "Failed to close scrcpy:",
          error
        );
      }

      mirrorProcess = null;
    }

    return {
      success: true,
    };
  }
);
ipcMain.handle("take-screenshot", async (_event, deviceId: string) => {
  if (!deviceId) {
    return {
      success: false,
      error: "No device connected",
    };
  }

const adbPath = getAdbPath();

  try {
    const result = await new Promise<Buffer>((resolve, reject) => {
      execFile(
        adbPath,
        [
          "-s",
          deviceId,
          "exec-out",
          "screencap",
          "-p",
        ],
        {
          encoding: "buffer",
          maxBuffer: 20 * 1024 * 1024,
        },
        (error, stdout, stderr) => {
         if (error) {
            reject(
              new Error(
                stderr?.toString() || error.message
              )
            );
            return;
          }

          resolve(Buffer.from(stdout));
        }
      );
    });

    const saveResult = await dialog.showSaveDialog({
      title: "Save PhoneDock Screenshot",
      defaultPath: `PhoneDock-${Date.now()}.png`,
      filters: [
        {
          name: "PNG Image",
          extensions: ["png"],
        },
      ],
    });

    if (saveResult.canceled || !saveResult.filePath) {
      return {
        success: false,
        error: "Screenshot save cancelled",
      };
    }

    const fs = await import("node:fs/promises");

    await fs.writeFile(
      saveResult.filePath,
      result
    );

    return {
      success: true,
      path: saveResult.filePath,
    };
  } catch (error) {
    console.error("SCREENSHOT ERROR:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
});
ipcMain.handle("ai-phone-command", async (_event, command: string) => {
  try {
    const result = await askPhoneDockAI(command);

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error("PhoneDock AI error:", error);

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "AI request failed",
    };
  }
});

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    sandbox: false,
  },
  })
  win.webContents.on(
  "preload-error",
  (_event, preloadPath, error) => {
    console.error("PRELOAD ERROR:", preloadPath);
    console.error(error);
  }
);

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', async () => {
  win?.webContents.send(
    'main-process-message',
    new Date().toLocaleString()
  )

  const bridgeTest = await win?.webContents.executeJavaScript(`
    typeof window.phoneDock + ":" + (window.phoneDock?.version ?? "")
  `)

  console.log("BRIDGE TEST:", bridgeTest)
})

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
