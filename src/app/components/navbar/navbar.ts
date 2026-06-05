import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userRole(): string | null {
    return this.authService.getRole();
  }

  get activeRole(): string | null {
    return this.authService.getActiveRole();
  }

  cambiarRolActivo(rol: 'administrador' | 'empleado' | 'super') {
    this.authService.setActiveRole(rol);
    alert(`Vista cambiada a: ${rol}`);
    // If the active role changes to empleado and the user is in /admin, redirect to /inicio
    if (rol === 'empleado' && this.router.url.includes('/admin')) {
      this.router.navigate(['/inicio']);
    }
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}