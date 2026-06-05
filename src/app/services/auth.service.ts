import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id_usuario: number;
  usuario: string;
  role: 'administrador' | 'empleado' | 'super';
  activeRole: 'administrador' | 'empleado' | 'super';
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

  getRole(): 'administrador' | 'empleado' | 'super' | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  getActiveRole(): 'administrador' | 'empleado' | 'super' | null {
    const user = this.getCurrentUser();
    return user ? user.activeRole : null;
  }

  setActiveRole(role: 'administrador' | 'empleado' | 'super'): void {
    const user = this.getCurrentUser();
    if (user && user.role === 'super') {
      user.activeRole = role;
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }
  }

  loginApi(correo: string, contrasena: string, rol: string): Observable<any> {
    return this.http.post(`${this.api}/login`, { correo, contrasena, rol });
  }

  login(id_usuario: number, usuario: string, role: 'administrador' | 'empleado' | 'super'): void {
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

