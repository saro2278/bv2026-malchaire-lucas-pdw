import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./router/dashboard-router/dashboard-router').then(
        (component) => component.DashboardRouter,
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./page/home-page/home-page').then(
            (page) => page.HomePage,
          ),
      },
    ],
  },
];