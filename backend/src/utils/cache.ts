export class Cache {
  private static store: Record<string, { value: any; expiresAt: number }> = {};

  static set(key: string, value: any, ttlSeconds: number) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store[key] = { value, expiresAt };
  }

  static get(key: string): any | null {
    const cached = this.store[key];
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      delete this.store[key];
      return null;
    }
    return cached.value;
  }

  static invalidate(key: string) {
    delete this.store[key];
  }
}
