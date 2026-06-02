import { Component } from '@angular/core';
import { JobService } from '../../job.service'; 

@Component({
  selector: 'app-job-form',
  templateUrl: './job-form.html',
  styleUrls: ['./job-form.css'],
  standalone: false 
})
export class JobForm {
  // Ajustamos los nombres de propiedades con mayúsculas para tu backend y MySQL
  nuevaVacante = {
    Titulo: '',
    Empresa: '',
    Descripcion: '',
    Sueldo: null
  };

  constructor(private jobService: JobService) { }

  guardarVacante() {
    if (!this.nuevaVacante.Titulo || !this.nuevaVacante.Empresa || !this.nuevaVacante.Descripcion) {
      alert('Por favor, rellene todos los campos obligatorios.');
      return;
    }

    this.jobService.createJob(this.nuevaVacante).subscribe({
      next: (response) => {
        alert('¡Vacante publicada con éxito en la Bolsa de Empleo Unipaz!');
        this.nuevaVacante = { Titulo: '', Empresa: '', Descripcion: '', Sueldo: null };
        setTimeout(() => {
          window.location.href = window.location.href;
        }, 500);
      },
      error: (err) => {
        console.error('Error al guardar la vacante:', err);
        alert('Hubo un error al conectar con el servidor.');
      }
    });
  }
}