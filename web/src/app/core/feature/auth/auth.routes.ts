import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./router/auth-router/auth-router').then(
        (component) => component.AuthRouter,
      ),
    children: [
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full',
      },
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./page').then((page) => page.SignInPage),
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./page').then((page) => page.SignUpPage),
      },
    ],
  },
];