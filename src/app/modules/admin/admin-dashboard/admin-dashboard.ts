import { Observable } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';   

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  tabActual: string = 'inicio';
  adminData: any = null;

  stats = { estudiantes: 0, empresas: 0, vacantes: 0 };
  empresas: any[] = [];
  vacantes: any[] = [];
  estudiantes: any[] = [];

  // Variables agregadas para el control del formulario dinámico de edición
  modoEdicion: boolean = false;
  vacanteEnEdicion: any = null;
  http: any;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log('--- PASO 1: ENTRANDO AL DASHBOARD ---');
    this.adminData = this.authService.getUsuarioActual();
    console.log('Datos del admin en localStorage inmediatos:', this.adminData);
    
    setTimeout(() => {
      console.log('--- PASO 2: DISPARANDO PETICIONES HTTP (100ms después) ---');
      this.cargarDatosPanel();
    }, 100);
  }

  cargarDatosPanel(): void {
    this.authService.getStats().subscribe({
      next: (data) => {
        if (data) this.stats = { ...data }; 
      },
      error: (err) => console.error('Error cargando estadísticas:', err)
    });

    this.authService.getEmpresas().subscribe({
      next: (data) => {
        console.log('--- RESPUESTA BACKEND: EMPRESAS ---', data);
        this.empresas = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando empresas:', err)
    });

    this.authService.getVacantes().subscribe({
      next: (data) => {
        this.vacantes = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando vacantes:', err)
    });

    this.authService.getEstudiantes().subscribe({
      next: (data) => {
        console.log('--- RESPUESTA BACKEND: ESTUDIANTES ---', data);
        this.estudiantes = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando estudiantes:', err)
    });
  }

  cambiarTab(tab: string): void {
    this.tabActual = tab;
    // Forzamos el cierre del editor si el admin cambia de pestaña del menú lateral
    if (tab !== 'vacantes') {
      this.cancelarEdicion();
    }
  }

  cambiarEstadoEmpresa(id: number, nuevoEstado: string): void {
    this.authService.actualizarEstadoEmpresa(id, nuevoEstado).subscribe({
      next: () => {
        console.log(`Empresa ${id} actualizada en BD a: ${nuevoEstado}`);
        this.cargarDatosPanel();
      },
      error: (err) => alert('Error al cambiar el estado de la empresa.')
    });
  }

  // Activa el modo edición creando un clon para salvaguardar los datos originales durante la edición
  editarVacante(vacante: any): void {
    console.log('Abriendo edición de vacante:', vacante);
    this.vacanteEnEdicion = { ...vacante };
    this.modoEdicion = true;
    this.cdr.detectChanges();
  }

  // Aborta el procedimiento de edición y limpia el búfer temporal
  cancelarEdicion(): void {
    this.vacanteEnEdicion = null;
    this.modoEdicion = false;
  }

  // Envía los campos modificados hacia la ruta PUT de tu Express
  guardarCambiosVacante(): void {
    if (!this.vacanteEnEdicion.titulo || !this.vacanteEnEdicion.empresa) {
      alert('El título de la oferta y la empresa son campos requeridos.');
      return;
    }

    // Adaptamos las claves locales al formato que espera tu 'app.put(/api/v1/jobs/:id)' en server.js
    const payloadSQL = {
      Titulo: this.vacanteEnEdicion.titulo,
      Descripcion: this.vacanteEnEdicion.descripcion || 'Sin descripción detallada asignada.',
      Empresa: this.vacanteEnEdicion.empresa,
      Sueldo: this.vacanteEnEdicion.salario
    };

    // Asegúrate de que este método exista en tu auth.service.ts apuntando a: this.http.put(`${this.apiUrl}/jobs/${id}`, datos)
    const requestAny: any = this.authService.actualizarVacante(this.vacanteEnEdicion.id, payloadSQL);

    // Manejar Observable (subscribe), Promise (then) o void (sin retorno)
    if (requestAny && typeof requestAny.subscribe === 'function') {
      requestAny.subscribe({
        next: (res: any) => {
          alert('¡Oferta laboral actualizada exitosamente en MySQL!');
          this.modoEdicion = false;
          this.vacanteEnEdicion = null;
          this.cargarDatosPanel();
        },
        error: (err: any) => {
          console.error('Inconveniente en la edición desde el panel administrador:', err);
          alert('No se pudo procesar la actualización en el servidor. Revisa el método del service.');
        }
      });
    } else if (requestAny && typeof requestAny.then === 'function') {
      requestAny.then(() => {
        alert('¡Oferta laboral actualizada exitosamente en MySQL!');
        this.modoEdicion = false;
        this.vacanteEnEdicion = null;
        this.cargarDatosPanel();
      }).catch((err: any) => {
        console.error('Inconveniente en la edición desde el panel administrador:', err);
        alert('No se pudo procesar la actualización en el servidor. Revisa el método del service.');
      });
    } else {
      // Si el método no retorna nada (void), asumimos que hizo el trabajo sincronamente
      // o no está implementado correctamente. Hacemos acciones locales seguras.
      console.warn('authService.actualizarVacante no devolvió Observable ni Promise.');
      this.modoEdicion = false;
      this.vacanteEnEdicion = null;
      this.cargarDatosPanel();
    }
  }

  eliminarVacante(id: number): void {
    if (confirm('¿Está seguro de eliminar permanentemente esta vacante del sistema real?')) {
      this.authService.eliminarVacante(id).subscribe({
        next: () => {
          console.log(`Vacante ${id} eliminada con éxito.`);
          this.cargarDatosPanel(); 
        },
        error: (err) => alert('No se pudo eliminar la vacante seleccionada.')
      });
    }
  }

  cambiarEstadoEstudiante(id: number, nuevoEstado: string): void {
    this.authService.actualizarEstadoEstudiante(id, nuevoEstado).subscribe({
      next: () => {
        console.log(`Estudiante ${id} modificado en BD a: ${nuevoEstado}`);
        this.cargarDatosPanel();
      },
      error: (err) => alert('Error al actualizar el acceso del estudiante.')
    });
  }

  cerrarSesion(): void {
    if (confirm('¿Desea cerrar sesión en el Panel Administrativo?')) {
      this.authService.cerrarSesion(); 
      this.router.navigate(['/auth/login']); 
    }
  }

  // ==========================================
// ACTUALIZAR VACANTE (MÉTODO PUT PARA SQL)
// ==========================================
actualizarVacante(id: number, datos: any): Observable<any> {
  // Nota: Asegúrate de que tu servicio tenga importado 'HttpClient' y la variable 'apiUrl' apuntando al puerto 3000
  return this.http.put(`http://localhost:3000/api/v1/jobs/${id}`, datos);
}

}