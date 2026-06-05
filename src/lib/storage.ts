export function getStorageKey(baseKey: string): string {
  if (typeof window === "undefined") return baseKey;
  
  const mockSessionStr = localStorage.getItem("mock_user_session");
  const isBypassed = localStorage.getItem("dev_bypass") === "true";
  
  let email = "";
  if (mockSessionStr) {
    try {
      const parsed = JSON.parse(mockSessionStr);
      email = parsed.email || "";
    } catch {
      // ignore
    }
  } else if (isBypassed) {
    email = "developer@halalhabit.com";
  }
  
  if (email) {
    return `${baseKey}-${email.toLowerCase()}`;
  }
  
  return baseKey;
}

export function getLocalItem(baseKey: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(getStorageKey(baseKey));
}

export function setLocalItem(baseKey: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(baseKey), value);
}

export function removeLocalItem(baseKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getStorageKey(baseKey));
}
