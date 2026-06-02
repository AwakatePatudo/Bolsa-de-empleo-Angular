import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class JobService {
private apiUrl = 'http://localhost:3000/api/v1/jobs';

constructor(private http: HttpClient) { }

getJobs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
}

createJob(job: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, job);
}

  // NUEVO: Modificar los datos de la vacante
updateJob(id: number, job: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, job);
}

  // NUEVO: Cambiar el estado Activo/Desactivado
toggleStatus(id: number, status: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { Activo: status });
}
}