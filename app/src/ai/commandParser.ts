import {
  actionRegistry,
  type PhoneAction,
  type ParsedAction,
} from "./actionRegistry";

export function parseCommand(
  command: string
): ParsedAction[] {
  const normalized = command
    .toLowerCase()
    .trim();

  if (!normalized) {
    return [];
  }

  const actions: ParsedAction[] = [];

  for (const [action, phrases] of Object.entries(
    actionRegistry
  )) {
    for (const phrase of phrases) {
      if (normalized.includes(phrase)) {
        actions.push({
          action: action as PhoneAction,
          confidence:
            normalized === phrase ? 1 : 0.9,
        });

        break;
      }
    }
  }

  return actions;
}