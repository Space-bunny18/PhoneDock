import {
  Battery,
  HardDrive,
  MemoryStick,
  Wifi,
  Smartphone,
  Zap,
  Home,
  ArrowLeft,
  Square,
  Volume2,
  VolumeX,
  Lock,
} from "lucide-react";

interface PhoneDashboardProps {
  model: string;
  manufacturer: string;
  connectionType: "usb" | "wifi" | null;
  connectionAddress: string;
    onHome: () => void;
    onBack: () => void;
    onRecent: () => void;
    onVolumeUp: () => void;
    onVolumeDown: () => void;
    onMute: () => void;
    onLock: () => void;
  androidVersion: string;
  battery: string;
  charging: boolean;
  storage: {
    total: string;
    used: string;
    free: string;
  } | null;
  ram: {
    total: string;
    available: string;
  } | null;
  network: {
    type: string;
    ip: string;
  } | null;
  connectionHealth: "checking" | "connected" | "offline";
}
function formatKb(kb: string) {
  const value = Number(kb);

  if (!Number.isFinite(value) || value <= 0) {
    return "Unknown";
  }

  const gb = value / (1024 * 1024);

  return `${gb.toFixed(1)} GB`;
}
function parseBatteryPercent(battery: string) {
  const match = battery.match(/\d+/);

  if (!match) return 0;

  return Math.min(100, Math.max(0, Number(match[0])));
}
function parseStoragePercent(
  storage: PhoneDashboardProps["storage"]
) {
  if (!storage) return 0;

  const total = Number(storage.total);
  const used = Number(storage.used);

  if (!total || Number.isNaN(total) || Number.isNaN(used)) {
    return 0;
  }

  return Math.min(100, Math.round((used / total) * 100));
}

function parseRamPercent(
  ram: PhoneDashboardProps["ram"]
) {
  if (!ram) return 0;

  const total = Number(ram.total);
  const available = Number(ram.available);

  if (
    !total ||
    Number.isNaN(total) ||
    Number.isNaN(available)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(((total - available) / total) * 100)
  );
}

function PhoneDashboard({
  model,
  manufacturer,
  androidVersion,
  battery,
  charging,
  storage,
  ram,
   network,
  connectionHealth,
  connectionType,
  connectionAddress,
   onHome,
    onBack,
    onRecent,
    onVolumeUp,
    onVolumeDown,
    onMute,
    onLock,
}: PhoneDashboardProps) {
    const batteryPercent = parseBatteryPercent(battery);
    const storagePercent = parseStoragePercent(storage);
    const ramPercent = parseRamPercent(ram);

  return (
    <section className="phone-dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            DEVICE OVERVIEW
          </span>

          <h2>Phone Dashboard</h2>

          <p>
            A quick look at your connected Android device.
          </p>
        </div>

        <div
          className={`dashboard-connection ${connectionHealth}`}
        >
          <span className="dashboard-connection-dot" />
          {connectionHealth === "connected"
            ? "Connected"
            : connectionHealth === "checking"
              ? "Checking"
              : "Offline"}
        </div>
      </div>

        <div className="dashboard-grid">
            <article className="dashboard-card device-overview-card">
                <div className="dashboard-card-icon">
                    <Smartphone size={20} />
                </div>

                <div className="dashboard-card-content">
                    <span>DEVICE</span>

                    <h3>
                    {model || "Android device"}
                    </h3>

                    <p>
                        {manufacturer || "Unknown manufacturer"}
                        {" • "}
                        Android {androidVersion || "Unknown"}
                    </p>

                    <div className="dashboard-device-meta">
                        <span>
                            {connectionType === "wifi"
                            ? "Wi-Fi ADB"
                            : connectionType === "usb"
                                ? "USB"
                                : "Connection unavailable"}
                        </span>

                        {connectionAddress && (
                            <span>{connectionAddress}</span>
                        )}
                    </div>
                </div>
            </article>

            <article className="dashboard-card battery-card">
            <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                {charging ? (
                    <Zap size={20} />
                ) : (
                    <Battery size={20} />
                )}
                </div>

                <span>BATTERY</span>
            </div>

            <strong>{battery || "Unknown"}</strong>

                <div className="dashboard-progress battery-progress">
                <span
                    style={{
                    width: `${batteryPercent}%`,
                    }}
                />
                </div>

                <p>
                {charging ? "Charging" : "Not charging"}
                </p>
            </article>

            <article className="dashboard-card">
            <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                <HardDrive size={20} />
                </div>

                <span>STORAGE</span>
            </div>

            <strong>{storagePercent}%</strong>

            <div className="dashboard-progress">
                <span
                style={{
                    width: `${storagePercent}%`,
                }}
                />
            </div>

                <p>
                    {storage
                        ? `${formatKb(storage.used)} used • ${formatKb(storage.free)} free`
                        : "Storage unavailable"}
                </p>

                    <small className="dashboard-resource-total">
                        {storage
                            ? `${formatKb(storage.total)} total`
                            : "Total unavailable"}
                    </small>
            </article>

            <article className="dashboard-card">
            <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                <MemoryStick size={20} />
                </div>

                <span>RAM</span>
            </div>

            <strong>{ramPercent}%</strong>

            <div className="dashboard-progress">
                <span
                style={{
                    width: `${ramPercent}%`,
                }}
                />
            </div>

            <p>
                {ram
                    ? `${formatKb(ram.available)} available`
                    : "RAM unavailable"}
                </p>

                <small className="dashboard-resource-total">
                {ram
                    ? `${formatKb(ram.total)} total`
                    : "Total unavailable"}
                </small>
            </article>

            <article className="dashboard-card network-card">
            <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                <Wifi size={20} />
                </div>

                <span>NETWORK</span>
            </div>

                <strong>
                {network?.type || "Unknown"}
                </strong>

                <p>
                {network?.ip
                    ? "Connected"
                    : "Network unavailable"}
                </p>

                <small className="dashboard-network-ip">
                {network?.ip || "IP unavailable"}
                </small>
            </article>
            <div className="dashboard-actions">
                <div className="dashboard-actions-header">
                    <div>
                    <span className="dashboard-eyebrow">
                        PHONE CONTROLS
                    </span>

                    <h3>Quick Actions</h3>
                    </div>
                </div>

                <div className="dashboard-action-grid">
                   <button onClick={onHome}>
                    <Home size={15} />
                    <span>Home</span>
                    </button>

                    <button onClick={onBack}>
                    <ArrowLeft size={15} />
                    <span>Back</span>
                    </button>

                    <button onClick={onRecent}>
                    <Square size={15} />
                    <span>Recent</span>
                    </button>

                    <button onClick={onVolumeUp}>
                    <Volume2 size={15} />
                    <span>Volume +</span>
                    </button>

                    <button onClick={onVolumeDown}>
                    <Volume2 size={15} />
                    <span>Volume −</span>
                    </button>

                    <button onClick={onMute}>
                    <VolumeX size={15} />
                    <span>Mute</span>
                    </button>

                    <button onClick={onLock}>
                    <Lock size={15} />
                    <span>Lock</span>
                    </button>
                </div>
            </div>
      </div>
    </section>
  );
}

export default PhoneDashboard;