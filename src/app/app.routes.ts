import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage),
      },
      {
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
      },
      {
        path: 'planes',
        loadComponent: () => import('./pages/planes/planes.page').then((m) => m.PlanesPage),
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/historial/historial.page').then((m) => m.HistorialPage),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/configuracion/configuracion.page').then((m) => m.ConfiguracionPage),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full',
  },
];