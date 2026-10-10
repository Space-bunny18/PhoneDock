import type { PhoneAction } from "./actionRegistry";

export interface PhoneActionHandlers {
  HOME: () => Promise<void>;
  BACK: () => Promise<void>;
  RECENT: () => Promise<void>;
  VOLUME_UP: () => Promise<void>;
  VOLUME_DOWN: () => Promise<void>;
  MUTE: () => Promise<void>;
  LOCK: () => Promise<void>;
}

export async function executeActions(
  actions: PhoneAction[],
  handlers: PhoneActionHandlers
) {
  for (const action of actions) {
    const handler = handlers[action];

    if (!handler) {
      console.warn(
        `No handler registered for action: ${action}`
      );
      continue;
    }

    await handler();
  }
}