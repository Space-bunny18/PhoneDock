import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("phoneDock", {
  version: "0.1.0",
});