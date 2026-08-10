import { Injectable, computed, signal } from '@angular/core';

export interface TokenPair { accessToken: string; refreshToken: string; expiresIn: number; }
export interface CurrentUser { id: string; email: string; name: string; }

@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private readonly accessKey = 'voxflow.access';
  private readonly refreshKey = 'voxflow.refresh';
  readonly accessToken = signal(sessionStorage.getItem(this.accessKey));
  readonly currentUser = computed<CurrentUser | null>(() => this.decode(this.accessToken()));
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  set(pair: TokenPair): void {
    sessionStorage.setItem(this.accessKey, pair.accessToken);
    sessionStorage.setItem(this.refreshKey, pair.refreshToken);
    this.accessToken.set(pair.accessToken);
  }

  refreshToken(): string | null { return sessionStorage.getItem(this.refreshKey); }

  clear(): void {
    sessionStorage.removeItem(this.accessKey); sessionStorage.removeItem(this.refreshKey); this.accessToken.set(null);
  }

  private decode(token: string | null): CurrentUser | null {
    if (!token) return null;
    try {
      const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
      if (!payload.sub || payload.exp * 1000 <= Date.now()) return null;
      return { id: payload.sub, email: payload.email ?? '', name: payload.name ?? payload.email ?? 'User' };
    } catch { return null; }
  }
}
