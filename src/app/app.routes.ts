import { Routes } from '@angular/router';

import { Inicio } from './components/inicio/inicio';
import { Menu } from './components/menu/menu';
import { Carrito } from './components/carrito/carrito';
import { Login } from './components/login/login';
import { Admin } from './components/admin/admin';
import { GestionUsuarios } from './components/gestion-usuarios/gestion-usuarios';
import { VentasComponent } from './components/ventas/ventas';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },

  { path: 'inicio', component: Inicio },

  { path: 'menu', component: Menu },

  { path: 'carrito', component: Carrito },

  { path: 'admin', component: Admin },

  { path: 'gestion-usuarios', component: GestionUsuarios },

  { path: 'ventas', component: VentasComponent }

];
