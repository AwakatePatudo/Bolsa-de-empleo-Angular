import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../../../services/auth.service'; 
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule]
})
export class LoginComponent {
  credenciales = {
    correo: '',
    contrasena: ''
  };

  errorMensaje: string = '';
  ocultarContrasena: boolean = true;

  constructor(private authService: AuthService, private router: Router) { }

  conmutarVisibilidad(): void {
    this.ocultarContrasena = !this.ocultarContrasena;
  }

enviarLogin(): void {
    this.errorMensaje = '';
    console.log('Intentando iniciar sesión con:', this.credenciales.correo);

    if (!this.credenciales.correo || !this.credenciales.contrasena) {
      this.errorMensaje = 'Por favor, digite todos los campos.';
      return;
    }
    
    this.authService.login(this.credenciales).subscribe({
      next: (res) => {
        console.log('Respuesta del backend recibida:', res);
        
        if (res && res.usuario) {
          this.authService.guardarSesion(res.usuario);
          const rol = (res.usuario.rol || res.usuario.Rol || '').toLowerCase().trim();
          let rutaDestino = '';

        if (rol === 'admin') {
          rutaDestino = '/admin/dashboard';
        } else if (rol === 'empresa') {
          rutaDestino = '/empresa/dashboard';  
        } else if (rol === 'estudiante') {
          rutaDestino = '/estudiante/dashboard';
        }

          console.log('Rol procesado:', rol, '-> Viajando a:', rutaDestino);

          if (rutaDestino) {
            this.router.navigate([rutaDestino]);
          } else {
            this.errorMensaje = 'El rol asignado no cuenta con una ruta de destino válida.';
          }
        } else {
          this.errorMensaje = 'Respuesta del servidor inválida.';
        }
      },
      error: (err) => {
        console.error('Error capturado en el login:', err);
        if (err.status === 401) {
          this.errorMensaje = 'Correo o contraseña incorrectos. Intente de nuevo.';
        } else {
          this.errorMensaje = 'Error de conexión con el servidor de la Bolsa de Empleo.';
        }
      }
    });
  }
}