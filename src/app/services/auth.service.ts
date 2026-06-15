import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AppRole = 'administrador' | 'empleado' | 'super' | 'cliente';

export interface User {
  id_usuario: number;
  usuario: string;
  role: AppRole;
  activeRole: AppRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserKey = 'dinastia_current_user';
  private api = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userJson = localStorage.getItem(this.currentUserKey);
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  getRole(): AppRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  getActiveRole(): AppRole | null {
    const user = this.getCurrentUser();
    return user ? user.activeRole : null;
  }

  setActiveRole(role: AppRole): void {
    const user = this.getCurrentUser();
    if (user && user.role === 'super') {
      user.activeRole = role;
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }
  }

  loginApi(correo: string, contrasena: string, rol: string): Observable<any> {
    return this.http.post(`${this.api}/login`, { correo, contrasena, rol });
  }

  registrarCliente(datos: { nombre: string; correo: string; telefono: string; contrasena: string }): Observable<any> {
    return this.http.post(`${this.api}/registro`, datos);
  }

  obtenerClientesUsuarios(): Observable<any> {
    return this.http.get(`${this.api}/clientes-usuarios`);
  }

  login(id_usuario: number, usuario: string, role: AppRole): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user: User = {
        id_usuario,
        usuario,
        role,
        activeRole: role
      };
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.currentUserKey);
    }
  }
}
