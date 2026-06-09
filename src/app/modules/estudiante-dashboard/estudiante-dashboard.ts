import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
selector: 'app-estudiante-dashboard',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './estudiante-dashboard.html',
styleUrls: ['./estudiante-dashboard.css']
})
export class EstudianteDashboardComponent implements OnInit {

tabActual: string = 'inicio';
estudianteData: any = null;
vacantes: any[] = [];
statsGlobales = { estudiantes: 0, empresas: 0, vacantes: 0 };
textoBusqueda: string = '';
archivoSeleccionado: File | null = null;

constructor(
    private authService: AuthService, 
    private router: Router, 
    private cdr: ChangeDetectorRef
) { }

ngOnInit(): void {
    // 1. Validamos la sesión del alumno
    this.estudianteData = this.authService.getUsuarioActual();
    
    if (!this.estudianteData) {
    this.router.navigate(['/auth/login']);
    return;
    }

    // 2. Cargamos toda la información desde el servidor express
    this.cargarDatosEstudiante();
}

cargarDatosEstudiante(): void {
    // A. Traer todas las vacantes para el catálogo de postulación
    this.authService.getVacantes().subscribe({
    next: (data) => {
        this.vacantes = (data || []).filter((v: any) => v.estado === 'Activa' || v.Activo === 1);
        this.cdr.detectChanges();
    },
    error: (err) => console.error('Error al cargar catálogo de empleo:', err)
    });

    // B. Traer las métricas globales para las tarjetas de bienvenida
    this.authService.getStats().subscribe({
    next: (data) => {
        if (data) {
        this.statsGlobales.estudiantes = data.estudiantes || 0;
        this.statsGlobales.empresas = data.empresas || 0;
        this.statsGlobales.vacantes = data.vacantes || 0;
        }
        this.cdr.detectChanges();
    },
    error: (err) => console.error('Error al cargar tarjetas de inicio:', err)
});
}

cambiarTab(tab: string): void {
    this.tabActual = tab;
    this.cdr.detectChanges();
}

get vacantesFiltradas() {
    if (!this.textoBusqueda.trim()) {
    return this.vacantes;
    }
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    return this.vacantes.filter(v => 
    v.titulo?.toLowerCase().includes(busqueda) || 
    v.empresa?.toLowerCase().includes(busqueda)
    );
}


onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
    const maxSizInMB = 2;
      if (file.size > maxSizInMB * 1024 * 1024) {
        alert('El archivo supera el límite de 2MB. Por favor, elige otro.');
        return;
    }
    this.archivoSeleccionado = file;
    this.cdr.detectChanges();
    }
}

  // Remueve el documento cargado
removerArchivo(): void {
    this.archivoSeleccionado = null;
    this.cdr.detectChanges();
}

  // Guarda la información del perfil del estudiante
guardarPerfilEstudiante(): void {
    if (this.archivoSeleccionado) {
    alert(`¡Perfil guardado con éxito!\nDocumento adjunto listo: ${this.archivoSeleccionado.name}`);
    } else {
    alert('Información de perfil actualizada sin documento adjunto.');
    }
}

postularseAVacante(vacante: any): void {
    alert(`¡Postulación exitosa! Tu hoja de vida ha sido enviada a: ${vacante.empresa || 'Ofertante'}.`);
}

cerrarSesion(): void {
    if (confirm('¿Seguro que deseas salir del Panel de Estudiantes UNIPAZ?')) {
    this.authService.cerrarSesion();
    this.router.navigate(['/auth/login']);
    }
}
}