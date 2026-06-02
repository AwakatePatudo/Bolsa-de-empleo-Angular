import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { JobService } from '../../job.service'; 
import { AuthService } from '../../../../services/auth.service'; // Para saber el rol

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.html',
  styleUrls: ['./job-list.css'],
  standalone: false
})
export class JobList implements OnInit {
  vacantes: any[] = []; 
  usuarioLogueado: any = null;

  // Variables para la edición
  vacanteEditando: any = null; 

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.usuarioLogueado = this.authService.getUsuarioActual();
    this.obtenerVacantes(); 
  }

  obtenerVacantes() {
    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.vacantes = data; 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error(err)
    });
  }

  // Función para Activar / Desactivar
  cambiarEstado(id: number, estadoActual: number) {
    const nuevoEstado = estadoActual === 1 ? 0 : 1;
    this.jobService.toggleStatus(id, nuevoEstado).subscribe({
      next: () => {
        alert('El estado de la vacante ha cambiado con éxito.');
        this.obtenerVacantes(); // Recargamos la lista
      },
      error: (err) => alert('Error al cambiar el estado.')
    });
  }

  // Activa el modo edición cargando los datos de la tarjeta en un objeto temporal
  iniciarEdicion(vacante: any) {
    this.vacanteEditando = { ...vacante };
  }

  cancelarEdicion() {
    this.vacanteEditando = null;
  }

  guardarCambios() {
    this.jobService.updateJob(this.vacanteEditando.Id, this.vacanteEditando).subscribe({
      next: () => {
        alert('¡Vacante actualizada correctamente!');
        this.vacanteEditando = null;
        this.obtenerVacantes();
      },
      error: (err) => alert('Error al intentar actualizar.')
    });
  }
}