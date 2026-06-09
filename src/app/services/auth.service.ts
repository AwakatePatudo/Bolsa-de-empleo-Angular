import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) { }

  login(credenciales: { correo: string, contrasena: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credenciales);
  }

  guardarSesion(usuario: any): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  getUsuarioActual(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token'); 
  }

  // ==================== ENDPOINTS DEL PANEL ADMINISTRATIVO ====================

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`);
  }

  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/empresas`);
  }

  actualizarEstadoEmpresa(id: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/empresas/${id}/estado`, { estado });
  }

  getVacantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/vacantes`);
  }

  eliminarVacante(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/vacantes/${id}`);
  }

  actualizarVacante(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/jobs/${id}`, datos);
  }

  getEstudiantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/estudiantes`);
  }

  actualizarEstadoEstudiante(id: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/estudiantes/${id}/estado`, { estado });
  }

  // ==================== ENDPOINTS DEL PANEL DE EMPRESAS ====================

  getEstadisticasPorEmpresa(empresa: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/jobs/valores-dashboard/${empresa}`);
  }

  crearVacante(vacante: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jobs`, vacante);
  }

  // ==================== ENDPOINTS DEL PANEL DE ESTUDIANTES ====================

  getVacantesParaEstudiantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/jobs`);
  }
}