import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalogo' },
  {
    path: 'catalogo',
    loadComponent: () => import('./catalogo/catalogo.component').then((m) => m.CatalogoComponent),
  },
  {
    path: 'pos',
    loadComponent: () => import('./pos/pos.component').then((m) => m.PosComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
];
