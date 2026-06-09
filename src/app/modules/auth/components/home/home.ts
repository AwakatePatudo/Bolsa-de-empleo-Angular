import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // 👈 Agregamos ChangeDetectorRef
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  cantEstudiantes: number = 0;
  cantEmpresas: number = 0;
  cantVacantes: number = 0;

  vacantesRecientes: any[] = [];

  private statsSub!: Subscription;
  private jobsSub!: Subscription;

  // 👈 Inyectamos cdr (ChangeDetectorRef) en el constructor
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarVacantesRecientes();
  }

  cargarEstadisticas(): void {
    this.statsSub = this.http.get<any>('http://localhost:3000/api/v1/home/stats').subscribe({
      next: (data) => {
        if (data) {
          this.cantEstudiantes = data.totalEstudiantes || 0;
          this.cantEmpresas = data.totalEmpresas || 0;
          this.cantVacantes = data.totalVacantes || 0;
          
          // 🚀 Forzamos a Angular a actualizar los ceros del HTML inmediatamente
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => {
        console.error('Error cargando estadisticas:', err);
      }
    });
  }

  cargarVacantesRecientes(): void {
    this.jobsSub = this.http.get<any[]>('http://localhost:3000/api/v1/home/latest-jobs').subscribe({
      next: (data) => {
        if (data) {
          this.vacantesRecientes = data;
          
          // 🚀 Forzamos a Angular a iterar el *ngFor de las vacantes de inmediato
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => {
        console.error('Error cargando vacantes recientes:', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.statsSub) this.statsSub.unsubscribe();
    if (this.jobsSub) this.jobsSub.unsubscribe();
  }
}