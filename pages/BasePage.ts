import { Page, Frame } from '@playwright/test';
import { CANVAS_FRAME_ORIGIN, TIMEOUTS } from '../constants/config';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected async getCanvasFrame(): Promise<Frame> {
    const start = Date.now();
    while (Date.now() - start < TIMEOUTS.canvasFrame) {
      const frame = this.page.frames().find(f => f.url().includes(CANVAS_FRAME_ORIGIN));
      if (frame) return frame;
      await this.page.waitForTimeout(500);
    }
    throw new Error(`Canvas frame not found: ${CANVAS_FRAME_ORIGIN}`);
  }
}
