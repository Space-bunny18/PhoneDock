export interface PhoneApp {
  name: string;
  packageName: string;
  activity: string;
  aliases: string[];
}

export function parseLaunchableApps(
  apps: string[]
): PhoneApp[] {
  return apps
    .map((entry) => {
      const separatorIndex = entry.indexOf("/");

      if (separatorIndex === -1) {
        return null;
      }

      const packageName =
        entry.slice(0, separatorIndex).trim();

      const activity =
        entry.slice(separatorIndex + 1).trim();

      if (!packageName || !activity) {
        return null;
      }

      const shortName =
        packageName
          .split(".")
          .filter(Boolean)
          .pop() ?? packageName;

      return {
        name: shortName,
        packageName,
        activity,
        aliases: [
          shortName.toLowerCase(),
          packageName.toLowerCase(),
        ],
      };
    })
    .filter(
      (app): app is PhoneApp =>
        app !== null
    );
}
export function resolveDiscoveredApp(
  command: string,
  apps: PhoneApp[]
): PhoneApp | null {
  const normalized = command
    .toLowerCase()
    .trim();

  if (!normalized) {
    return null;
  }

  const words = normalized
    .split(/\s+/)
    .filter(Boolean);

  // Remove common command words.
  const searchTerms = words.filter(
    (word) =>
      ![
        "open",
        "launch",
        "start",
        "app",
        "application",
        "the",
        "please",
        "my",
      ].includes(word)
  );

  if (searchTerms.length === 0) {
    return null;
  }

  // 1. Prefer exact package-name / alias matches.
  for (const app of apps) {
    const matches = [
      app.name,
      app.packageName,
      ...app.aliases,
    ].map((value) =>
      value.toLowerCase()
    );

    if (
      matches.some(
        (value) =>
          value === normalized ||
          searchTerms.join(" ") === value
      )
    ) {
      return app;
    }
  }

  // 2. Match the complete app name inside the command.
  for (const app of apps) {
    const matches = [
      app.name,
      app.packageName,
      ...app.aliases,
    ].map((value) =>
      value.toLowerCase()
    );

    if (
      matches.some((value) =>
        normalized.includes(value)
      )
    ) {
      return app;
    }
  }

  // 3. Match all meaningful words against the app identity.
  for (const app of apps) {
    const identity = [
      app.name,
      app.packageName,
      ...app.aliases,
    ]
      .join(" ")
      .toLowerCase();

    if (
      searchTerms.every((term) =>
        identity.includes(term)
      )
    ) {
      return app;
    }
  }

  return null;
}
