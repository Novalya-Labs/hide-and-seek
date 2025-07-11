import { logger } from '@/utils/logger';

export class TimerService {
  private timers = new Map<string, NodeJS.Timeout>();

  startHidingTimer(roomId: string, onTick: (timeLeft: number) => void, onEnd: () => void, duration = 30000): void {
    this.clearTimer(roomId);

    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeLeft = Math.max(0, duration - elapsed);

      onTick(timeLeft);

      if (timeLeft <= 0) {
        this.clearTimer(roomId);
        onEnd();
      }
    }, 1000);

    this.timers.set(roomId, timer);
    logger.info(`Hiding timer started for room ${roomId}, duration: ${duration}ms`);
  }

  clearTimer(roomId: string): void {
    const timer = this.timers.get(roomId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(roomId);
      logger.info(`Timer cleared for room ${roomId}`);
    }
  }

  clearAllTimers(): void {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();
    logger.info('All timers cleared');
  }

  hasActiveTimer(roomId: string): boolean {
    return this.timers.has(roomId);
  }
}
