import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { AuthTokenStore, TokenPair } from './auth-token.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly tokens = inject(AuthTokenStore);

  login(email: string, password: string): Observable<TokenPair> {
    return this.http.post<TokenPair>(`${this.baseUrl}/auth/login`, { email, password }).pipe(tap((pair) => this.tokens.set(pair)));
  }
  register(email: string, password: string, displayName: string): Observable<TokenPair> {
    return this.http.post<TokenPair>(`${this.baseUrl}/auth/register`, { email, password, displayName }).pipe(tap((pair) => this.tokens.set(pair)));
  }
}
