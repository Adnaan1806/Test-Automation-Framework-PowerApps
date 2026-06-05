export const APP_URL =
  process.env.APP_URL ??
  'https://apps.powerapps.com/play/e/88aafdc6-17fa-4c32-a5b5-35dbdbdf05c0/a/9d4e32af-d89c-4685-abc5-cdaa1913fd0c?tenantId=44f4e7a6-4821-44d7-b286-cd90436c6975&hint=a1f62549-ee5e-4ef6-a14c-97c22de63013&sourcetime=1779346434761&source=portal#';

export const CANVAS_FRAME_ORIGIN = 'runtime-app.powerplatform.com';

export const TIMEOUTS = {
  domLoad:        60_000,
  canvasFrame:   120_000,
  appReady:      120_000,
  navigation:     60_000,
  elementVisible: 30_000,
  galleryUpdate:  30_000,
  save:          120_000,
} as const;
