import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenStore } from './auth-token.store';

export const authGuard: CanActivateFn = () => {
  const tokens = inject(AuthTokenStore); const router = inject(Router);
  return tokens.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
export const guestGuard: CanActivateFn = () => {
  const tokens = inject(AuthTokenStore); const router = inject(Router);
  return tokens.isAuthenticated() ? router.createUrlTree(['/projects']) : true;
};
