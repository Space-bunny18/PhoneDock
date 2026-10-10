import { useState } from "react";

interface DeviceHeaderProps {
  model: string;
  manufacturer: string;
  androidVersion: string;
  battery: string;
  connectionMode: "usb" | "wifi" | "auto";
  onConnectionModeChange: (
    mode: "usb" | "wifi" | "auto"
  ) => void;
  onDisconnect: () => void;
  activeConnection: "usb" | "wifi" | null;
  connectionAddress: string;
  connectionHealth: "checking" | "connected" | "offline";
  onSwitchDevice: () => void;
  onReconnect: () => void;
  charging: boolean;
}
function DeviceHeader({
  model,
  manufacturer,
  androidVersion,
  battery,
  connectionMode,
  activeConnection,
  onConnectionModeChange,
  onDisconnect,
  connectionAddress,
  connectionHealth,
  onSwitchDevice,
  onReconnect,
  charging,
}: DeviceHeaderProps) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="device-header">
      <div className="device-header-left">
        <div className="device-status-dot" />

        <div>
          <h2>{model}</h2>

          <span>
            {manufacturer} • Phone connected
          </span>
        </div>
      </div>

      <div className="device-header-meta">
        <span>Android {androidVersion}</span>

        <span>
          Battery {battery}
          {charging ? " • Charging" : ""}
        </span>

        <select
          value={connectionMode}
          onChange={(event) =>
            onConnectionModeChange(
              event.target.value as
                | "usb"
                | "wifi"
                | "auto"
            )
          }
          aria-label="Connection mode"
        >
          <option value="usb">USB</option>
          <option value="wifi">Wi-Fi</option>
          <option value="auto">Auto</option>
        </select>

        {activeConnection && (
          <div className="connection-status-wrap">
            <button
              type="button"
              className="active-connection"
              onClick={() =>
                setShowDiagnostics((prev) => !prev)
              }
            >
              <span
                className={`active-connection-dot ${connectionHealth}`}
              />
              {activeConnection === "wifi"
                ? "Wi-Fi"
                : "USB"}
            </button>

            {showDiagnostics && (
              <div className="connection-diagnostics">
                <div className="diagnostic-row">
                  <span>Mode</span>
                  <strong>
                    {connectionMode === "auto"
                      ? "Auto"
                      : connectionMode === "wifi"
                        ? "Wi-Fi"
                        : "USB"}
                  </strong>
                </div>

                <div className="diagnostic-row">
                  <span>Transport</span>
                  <strong>
                    {activeConnection === "wifi"
                      ? "Wi-Fi"
                      : "USB"}
                  </strong>
                </div>

                {connectionAddress && (
                  <div className="diagnostic-row">
                    <span>Endpoint</span>
                    <strong>
                      {connectionAddress}
                    </strong>
                  </div>
                )}

                <div className="diagnostic-row">
                  <span>Status</span>
                  <strong>
                    {connectionHealth === "checking"
                      ? "Checking..."
                      : connectionHealth === "connected"
                        ? "Connected"
                        : "Offline"}
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}
          {connectionHealth === "offline" && (
          <button
            type="button"
            onClick={onReconnect}
          >
            Reconnect
          </button>
        )}
        <button
          type="button"
          onClick={onSwitchDevice}
        >
          Switch device
        </button>

        <button
          type="button"
          onClick={onDisconnect}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default DeviceHeader;