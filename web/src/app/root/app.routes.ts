import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('../core/feature/auth/auth.routes').then(
        (routes) => routes.authRoutes,
      ),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../core/feature/dashboard/dashboard.routes').then(
        (routes) => routes.dashboardRoutes,
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];