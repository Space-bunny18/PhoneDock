import {
  allowedActions,
  type PhoneAction,
} from "./actionRegistry";

export interface AICommandResult {
  actions: PhoneAction[];
  message: string;
}

export function validateAIResult(
  actions: string[]
): PhoneAction[] {
  return actions.filter(
    (action): action is PhoneAction =>
      allowedActions.includes(action as PhoneAction)
  );
}