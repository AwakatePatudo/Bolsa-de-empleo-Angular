import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class AuthService {
  // Apunta a la ruta de Node.js que creamos en tu server.js
private apiUrl = 'http://localhost:3000/api/v1/auth/login';

constructor(private http: HttpClient) { }

  // Envía las credenciales a la API de Node.js
login(credenciales: { correo: string, contrasena: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credenciales);
}

  // Guarda el usuario y su rol en la memoria local del navegador
guardarSesion(usuario: any) {
    localStorage.setItem('usuario_bolsa', JSON.stringify(usuario));
}

  // Obtiene los datos de quién está navegando actualmente
getUsuarioActual() {
    const datos = localStorage.getItem('usuario_bolsa');
    return datos ? JSON.parse(datos) : null;
}

  // Borra la sesión para salir del sistema
cerrarSesion() {
    localStorage.removeItem('usuario_bolsa');
    window.location.reload();
}
}