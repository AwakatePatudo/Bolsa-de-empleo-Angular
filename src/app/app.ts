import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'bolsa-empleo';
  usuarioLogueado: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Al arrancar, verificamos si ya inició sesión antes
    this.usuarioLogueado = this.authService.getUsuarioActual();
  }

  salir() {
    this.authService.cerrarSesion();
  }
}