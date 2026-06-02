import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Soporte para los formularios de la bolsa de empleo

// Corregimos las rutas añadiendo la subcarpeta 'components'
import { JobList } from './components/job-list/job-list';
import { JobForm } from './components/job-form/job-form';

@NgModule({
  declarations: [
    JobList, 
    JobForm
  ],
  imports: [
    CommonModule,
    FormsModule // Habilitamos el uso de formularios en el módulo
  ],
  exports: [
    JobList, // Los exportamos para que app.component.html los pueda dibujar
    JobForm
  ]
})
export class JobsModule {}