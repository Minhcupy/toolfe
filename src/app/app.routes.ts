import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/auth-page').then((m) => m.AuthPage),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-list-page').then((m) => m.ProjectListPage),
  },
  {
    path: 'projects/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-create-page').then((m) => m.ProjectCreatePage),
  },
  {
    path: 'projects/:projectId/upload',
    canActivate: [authGuard],
    loadComponent: () => import('./features/upload/upload-page').then((m) => m.UploadPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'projects' },
  { path: '**', redirectTo: 'projects' },
];
