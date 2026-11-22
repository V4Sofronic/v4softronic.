import { AnalyticsModel } from "../models/analytics.model.js";

export function recordEvent(request, response) {
  AnalyticsModel.record(request.validatedEvent);
  response.status(201).json({ ok: true });
}

export function getAnalytics(request, response) {
  response.json({ analytics: AnalyticsModel.summary() });
}
