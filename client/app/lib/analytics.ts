export type DeviceType = "mobile" | "tablet" | "desktop";

const visitorStorageKey = "v4-analytics-visitor";
const visitorIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readOrCreateVisitorId(storage: Storage) {
  const savedId = storage.getItem(visitorStorageKey);
  if (savedId && visitorIdPattern.test(savedId)) return savedId;
  const visitorId = window.crypto.randomUUID();
  storage.setItem(visitorStorageKey, visitorId);
  return visitorId;
}

function getVisitorId() {
  try {
    return readOrCreateVisitorId(window.localStorage);
  } catch {
    try {
      return readOrCreateVisitorId(window.sessionStorage);
    } catch {
      return window.crypto.randomUUID();
    }
  }
}

function getDeviceType(): DeviceType {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/ipad|tablet|kindle|silk/.test(userAgent) || (/android/.test(userAgent) && !/mobile/.test(userAgent))) {
    return "tablet";
  }
  if (/mobi|iphone|ipod|android/.test(userAgent)) return "mobile";
  return "desktop";
}

export function getAnalyticsIdentity() {
  return {
    visitorId: getVisitorId(),
    deviceType: getDeviceType(),
  };
}
