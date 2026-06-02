import { Component } from '@angular/core';
import { AuthService } from '../../../../services/auth.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  // Objeto para capturar las credenciales del HTML
  credenciales = {
    correo: '',
    contrasena: ''
  };

  constructor(private authService: AuthService) { }

  enviarLogin() {
    if (!this.credenciales.correo || !this.credenciales.contrasena) {
      alert('Por favor, digite todos los campos.');
      return;
    }
    this.authService.login(this.credenciales).subscribe({
      next: (res) => {
        alert(`¡Bienvenido, ${res.usuario.nombre}! Rol: ${res.usuario.rol}`);
        this.authService.guardarSesion(res.usuario);
        window.location.reload();
      },
      error: (err) => {
        console.error('Error en el login:', err);
        alert('Correo o contraseña incorrectos. Intente de nuevo.');
      }
    });
  }
}