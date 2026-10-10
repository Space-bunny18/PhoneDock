import { useEffect, useState } from "react";

import {
  RefreshCw,
  Keyboard,
  Home,
  Camera,
  History,
  Maximize2,
  Settings,
  ArrowLeft,
  Volume2,
  VolumeX,
  Lock,
} from "lucide-react";

interface MirrorWorkspaceProps {
  onHome: () => void;
  onBack: () => void;
  onRecent: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onMute: () => void;
  onLock: () => void;
  onMirror: () => void;
  onRefresh: () => void;
  onKeyboard: () => void;
  onScreenshot: () => void;
  onFullscreen: () => void;

  onMirrorSettingsChange: (settings: {
    quality: "performance" | "balanced" | "quality";
    fps: string;
    resolution: string;
    bitrate: string;
  }) => void;

  isFullscreen: boolean;
  mirrorStarting: boolean;
  mirrorStatus: string;
  connectionHealth: "checking" | "connected" | "offline";
}

function MirrorWorkspace({
  onMirror,
  onRefresh,
  onKeyboard,
  onScreenshot,
  onFullscreen,
  onMirrorSettingsChange,
  isFullscreen,
  mirrorStarting,
  mirrorStatus,
  connectionHealth,
  onHome,
  onBack,
  onRecent,
  onVolumeUp,
  onVolumeDown,
  onMute,
  onLock,
}: MirrorWorkspaceProps) {
  const [showSettings, setShowSettings] = useState(false);

  const [mirrorQuality, setMirrorQuality] =
    useState<"performance" | "balanced" | "quality">("balanced");

  const [mirrorFps, setMirrorFps] = useState("30");

  const [mirrorResolution, setMirrorResolution] =
    useState("960");

  const [mirrorBitrate, setMirrorBitrate] =
    useState("4");
  const mirrorLive = mirrorStatus === "Live";
      useEffect(() => {
      const savedSettings = localStorage.getItem(
        "phonedock-mirror-settings"
      );

      if (!savedSettings) return;

      try {
        const parsed = JSON.parse(savedSettings);

        if (parsed.quality) {
          setMirrorQuality(parsed.quality);
        }

        if (parsed.fps) {
          setMirrorFps(parsed.fps);
        }

        if (parsed.resolution) {
          setMirrorResolution(parsed.resolution);
        }

        if (parsed.bitrate) {
          setMirrorBitrate(parsed.bitrate);
        }
      } catch {
        localStorage.removeItem(
          "phonedock-mirror-settings"
        );
      }
    }, []);

  useEffect(() => {
    onMirrorSettingsChange({
      quality: mirrorQuality,
      fps: mirrorFps,
      resolution: mirrorResolution,
      bitrate: mirrorBitrate,
    });
  }, [
    mirrorQuality,
    mirrorFps,
    mirrorResolution,
    mirrorBitrate,
    onMirrorSettingsChange,
  ]);
  useEffect(() => {
  localStorage.setItem(
    "phonedock-mirror-settings",
    JSON.stringify({
      quality: mirrorQuality,
      fps: mirrorFps,
      resolution: mirrorResolution,
      bitrate: mirrorBitrate,
    })
  );
}, [
  mirrorQuality,
  mirrorFps,
  mirrorResolution,
  mirrorBitrate,
]);
  return (
    <section
      className={`mirror-workspace ${
        isFullscreen ? "mirror-fullscreen" : ""
      }`}
    >
      <div className="mirror-topbar">
        <div>
          <span className="workspace-label">
            PHONE MIRROR
          </span>

         <h3>
          {mirrorStarting
            ? "Starting mirror"
            : mirrorStatus === "Live"
              ? "Live device"
              : "Mirror ready"}
        </h3>
        </div>

        <span
          className={`live-indicator ${
            mirrorStatus === "Live"
              ? "live"
              : mirrorStarting ||
                  mirrorStatus === "Refreshing mirror..."
                ? "starting"
                : "ready"
          }`}
        >
          <span />
          {mirrorStatus}
        </span>
      </div>

      <div className="mirror-stage">
        <button
          className="launch-mirror-button"
          onClick={onMirror}
          disabled={
            mirrorStarting ||
            mirrorLive ||
            connectionHealth !== "connected"
          }
        >
          {mirrorStarting ? (
            <>
              <span className="mirror-spinner" />
              {mirrorStatus}
            </>
          ) : (
            mirrorStatus === "Live"
            ? "Mirror active"
            : "Open live mirror"
          )}
        </button>
      </div>

      <div className="mirror-controls">
       <button
          type="button"
          title="Refresh mirror"
          aria-label="Refresh mirror"
          onClick={onRefresh}
          disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
        >
          <RefreshCw
            size={14}
            strokeWidth={1.7}
          />
        </button>

        <button
          type="button"
          title="Keyboard"
          aria-label="Keyboard"
          onClick={onKeyboard}
         disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
        >
          <Keyboard
            size={14}
            strokeWidth={1.7}
          />
        </button>

        <button
          type="button"
          title="Screenshot"
          aria-label="Screenshot"
          onClick={onScreenshot}
          disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
        >
          <Camera
            size={14}
            strokeWidth={1.7}
          />
        </button>

       <button
            type="button"
            title={
              isFullscreen
                ? "Exit fullscreen"
                : "Fullscreen"
            }
            aria-label={
              isFullscreen
                ? "Exit fullscreen"
                : "Fullscreen"
            }
            onClick={onFullscreen}
            disabled={
              !mirrorLive ||
              mirrorStarting ||
              connectionHealth !== "connected"
            }
          >
          <Maximize2
            size={14}
            strokeWidth={1.7}
          />
        </button>
        <button
          type="button"
          onClick={onHome}
          disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
          title="Home"
          aria-label="Home"
        >
          <Home size={18} />
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          onClick={onRecent}
          disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
          title="Recent Apps"
          aria-label="Recent Apps"
        >
          <History size={18} />
        </button>
        <button
          type="button"
          onClick={onVolumeUp}
          disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
          title="Volume Up"
          aria-label="Volume Up"
        >
          <Volume2 size={18} />
        </button>
        <button
          type="button"
          onClick={onVolumeDown}
          disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
          title="Volume Down"
          aria-label="Volume Down"
        >
          <Volume2 size={18} />
        </button>
        <button
          type="button"
          onClick={onMute}
          disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
          title="Mute"
          aria-label="Mute"
        >
          <VolumeX size={18} />
        </button>
        <button
          type="button"
          onClick={onLock}
          disabled={
            !mirrorLive ||
            mirrorStarting ||
            connectionHealth !== "connected"
          }
          title="Lock Phone"
          aria-label="Lock Phone"
        >
          <Lock size={18} />
        </button>
        <button
          type="button"
          onClick={() =>
            setShowSettings((prev) => !prev)
          }
          title="Mirror settings"
          aria-label="Mirror settings"
        >
          <Settings
            size={15}
            strokeWidth={1.7}
          />
        </button>
      </div>

      {showSettings && (
        <div className="mirror-settings-panel">
          <div className="mirror-settings-header">
            <div>
              <span>DISPLAY</span>
              <h4>Mirror settings</h4>
              <p className="mirror-settings-note">
                Changes apply when the mirror is opened again.
              </p>
              <button
                type="button"
                className="mirror-settings-reset"
                onClick={() => {
                  setMirrorQuality("balanced");
                  setMirrorFps("30");
                  setMirrorResolution("960");
                  setMirrorBitrate("4");
                }}
              >
                Reset defaults
              </button>
            </div>
          </div>

          <div className="mirror-setting">
            <div>
              <strong>Quality</strong>
              <span>
                Adjust mirror performance
              </span>
            </div>

            <select
              value={mirrorQuality}
              onChange={(event) =>
                setMirrorQuality(
                  event.target.value as
                    | "performance"
                    | "balanced"
                    | "quality"
                )
              }
            >
              <option value="performance">
                Performance
              </option>

              <option value="balanced">
                Balanced
              </option>

              <option value="quality">
                Quality
              </option>
            </select>
          </div>

          <div className="mirror-setting">
            <div>
              <strong>Frame rate</strong>
              <span>
                Maximum mirror FPS
              </span>
            </div>

            <select
              value={mirrorFps}
              onChange={(event) =>
                setMirrorFps(event.target.value)
              }
            >
              <option value="30">30 FPS</option>
              <option value="45">45 FPS</option>
              <option value="60">60 FPS</option>
            </select>
          </div>

          <div className="mirror-setting">
            <div>
              <strong>Resolution</strong>
              <span>
                Maximum video size
              </span>
            </div>

            <select
              value={mirrorResolution}
              onChange={(event) =>
                setMirrorResolution(
                  event.target.value
                )
              }
            >
              <option value="720">720p</option>
              <option value="960">960p</option>
              <option value="1280">1280p</option>
            </select>
          </div>

          <div className="mirror-setting">
            <div>
              <strong>Bitrate</strong>
              <span>
                Video stream quality
              </span>
            </div>

            <select
              value={mirrorBitrate}
              onChange={(event) =>
                setMirrorBitrate(
                  event.target.value
                )
              }
            >
              <option value="2">2 Mbps</option>
              <option value="4">4 Mbps</option>
              <option value="6">6 Mbps</option>
              <option value="8">8 Mbps</option>
            </select>
          </div>
        </div>
      )}
    </section>
  );
}

export default MirrorWorkspace;