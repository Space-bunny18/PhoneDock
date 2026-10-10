export type PhoneAction =
  | "HOME"
  | "BACK"
  | "RECENT"
  | "VOLUME_UP"
  | "VOLUME_DOWN"
  | "MUTE"
  | "LOCK"

export interface ParsedAction {
  action: PhoneAction;
  confidence: number;
}

export const actionRegistry: Record<
  PhoneAction,
  string[]
> = {
  HOME: [
    "home",
    "go home",
    "press home",
    "home screen",
    "take me home",
    "take me to the home screen",
    "go to home screen",
    "return to home screen",
    "show home screen",
  ],

  BACK: [
    "back",
    "go back",
    "press back",
    "return back",
    "go one step back",
    "return to previous screen",
    "previous screen",
  ],

  RECENT: [
    "recent",
    "recent apps",
    "open recent apps",
    "show recent apps",
    "show my open apps",
    "show open apps",
    "what apps are open",
    "show running apps",
    "show my recent applications",
  ],

  VOLUME_UP: [
    "volume up",
    "increase volume",
    "turn volume up",
    "louder",
    "make it louder",
    "make the phone louder",
    "increase the sound",
    "raise the volume",
  ],

  VOLUME_DOWN: [
    "volume down",
    "decrease volume",
    "turn volume down",
    "lower volume",
    "quieter",
    "make it quieter",
    "make the phone quieter",
    "decrease the sound",
    "lower the sound",
  ],

  MUTE: [
    "mute",
    "mute phone",
    "silence phone",
    "silent",
  ],

  LOCK: [
    "lock",
    "lock phone",
    "lock my phone",
    "put my phone to sleep",
    "sleep my phone",
    "turn off the screen",
    "sleep the phone",
  ],
};
export const allowedActions: PhoneAction[] = [
  "HOME",
  "BACK",
  "RECENT",
  "VOLUME_UP",
  "VOLUME_DOWN",
  "MUTE",
  "LOCK",
];