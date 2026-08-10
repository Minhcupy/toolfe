import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenStore } from './auth-token.store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthTokenStore).accessToken();
  return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request);
};
