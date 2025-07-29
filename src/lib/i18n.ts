import namespaces from "../locales/namespaces.json";

export async function loadLocaleMessages(locale: string) {
  const messages: Record<string, any> = {};

  for (const ns of namespaces) {
    try {
      const module = await import(`../locales/${locale}/${ns}.json`);
      messages[ns] = module.default;
    } catch (err) {
      console.warn(`Missing translation file: ${locale}/${ns}.json`);
    }
  }

  return messages;
}

export function getBrowserLocale(): string {
  if (typeof window === "undefined") {
    return "en-US";
  }
  const lang = navigator.language;
  return ["en-US", "zh-CN"].includes(lang) ? lang : "en-US";
}
