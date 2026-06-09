import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-empresa-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresa-dashboard.html',
  styleUrls: ['./empresa-dashboard.css']
})
export class EmpresaDashboard implements OnInit {
  
  // Control de navegación del menú lateral
  pestanaActiva: string = 'resumen';
  
  // Almacena la información de la empresa logueada
  empresaData: any = null;

  // Estructura de contadores para los recuadros principales
  statsEmpresa = {
    totalVacantes: 0,
    totalPostulados: 0,
    totalRevision: 0
  };

  // Modelo del formulario amarrado con [(ngModel)] en el HTML
  nuevaVacante: any = {
    Titulo: '',
    Descripcion: '',
    Sueldo: null,
    Empresa: ''
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef // Mecanismo para forzar el renderizado visual
  ) { }

  ngOnInit(): void {
    // 1. Extraemos los datos de la sesión actual
    const sesion = this.authService.getUsuarioActual(); 
    this.empresaData = sesion;

    if (sesion) {
      // 2. Sincronizamos con la propiedad 'nombre' exacta de tu server.js (MySQL)
      const nombreEmpresaLogueada = sesion.nombre || sesion.Nombre || '';
      
      // Aseguramos que cualquier vacante nueva herede el nombre de la empresa dueña de la sesión
      this.nuevaVacante.Empresa = nombreEmpresaLogueada;
      
      // 3. Consultamos las métricas reales iniciales en MySQL
      this.cargarMetricasEmpresa(nombreEmpresaLogueada);
    } else {
      // Redirección de seguridad si no hay sesión activa
      this.router.navigate(['/auth/login']);
    }
  }

  // Cambia dinámicamente las vistas del panel de control
  cambiarPestana(pestana: string): void {
    this.pestanaActiva = pestana;
    this.cdr.detectChanges(); 
  }

  // Recupera los conteos de filas directamente desde la base de datos MySQL
  cargarMetricasEmpresa(nombreEmpresa: string): void {
    if (!nombreEmpresa) return;

    this.authService.getEstadisticasPorEmpresa(nombreEmpresa).subscribe({
      next: (data: any) => {
        if (data) {
          // Mapeamos las propiedades numéricas enviadas por las queries SQL de tu backend
          this.statsEmpresa.totalVacantes = data.publicadas || 0;
          this.statsEmpresa.totalPostulados = data.postulaciones || 0;
          this.statsEmpresa.totalRevision = data.enRevision || 0;
        }
        this.cdr.detectChanges(); // Forzamos actualización visual de las tarjetas
      },
      error: (err: any) => {
        console.error('Métricas no devueltas por la API en este intento:', err);
      }
    });
  }

  // Envía la información recopilada del formulario hacia Express
  crearNuevaVacante(): void {
    if (!this.nuevaVacante.Titulo || !this.nuevaVacante.Descripcion) {
      alert('Por favor, diligencie los campos obligatorios.');
      return;
    }

    this.authService.crearVacante(this.nuevaVacante).subscribe({
      next: (res: any) => {
        alert('Oferta publicada con éxito en la Bolsa de Empleo UNIPAZ!');
        
        // Almacenamos temporalmente el nombre para no perderlo al limpiar el objeto
        const empresaActual = this.nuevaVacante.Empresa;

        // Limpiamos los inputs del formulario de forma segura
        this.nuevaVacante.Titulo = '';
        this.nuevaVacante.Descripcion = '';
        this.nuevaVacante.Sueldo = null;
        this.nuevaVacante.Empresa = empresaActual;
        
        // Solicitamos a MySQL recalcular los totales e incrementar los contadores en pantalla
        this.cargarMetricasEmpresa(empresaActual);
      },
      error: (err: any) => {
        console.error('Error controlado al guardar:', err);
        
        // Fallback de contingencia: En caso de desfase, limpia el formulario de igual modo
        const empresaActual = this.nuevaVacante.Empresa;
        this.nuevaVacante.Titulo = '';
        this.nuevaVacante.Descripcion = '';
        this.nuevaVacante.Sueldo = null;
        this.nuevaVacante.Empresa = empresaActual;
        
        this.cargarMetricasEmpresa(empresaActual);
      }
    });
  }

  // Destruye y limpia el estado de sesión del usuario
  cerrarSesion(): void {
    if (this.authService && typeof this.authService.cerrarSesion === 'function') {
      this.authService.cerrarSesion();
    }
    this.router.navigate(['/auth/login']);
  }
}