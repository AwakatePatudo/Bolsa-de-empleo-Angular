import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-register-company',
  templateUrl: './register-company.html',
  styleUrls: ['./register-company.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule]
})
export class RegisterCompany implements OnInit {
  empresaForm!: FormGroup;
  verContrasena: boolean = false;
  verConfirmarContrasena: boolean = false;

  private API_URL = 'http://localhost:3000/api/v1/auth/register-company';
  constructor(
    private fb: FormBuilder, 
    public router: Router,
    private http: HttpClient 
  ) { }

  ngOnInit(): void {
    this.empresaForm = this.fb.group({
      razonSocial: ['', Validators.required],
      nit: ['', [Validators.required, Validators.pattern('^[0-9]+-[0-9]{1}$')]],
      correo: ['', [Validators.required, Validators.email]],
      sectorEconomico: ['Tecnología e Informática', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      contrasena: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[0-9])/)]],
      confirmarContrasena: ['', Validators.required]
    }, {
      validators: (group: FormGroup) => {
        const contrasena = group.get('contrasena')?.value;
        const confirmar = group.get('confirmarContrasena')?.value;
        return contrasena === confirmar ? null : { noCoincide: true };
      }
    });
  }

  get f() { return this.empresaForm.controls; }

  navegarAlLogin(): void {
    this.router.navigate(['/auth/login']).catch(err => this.router.navigate(['/login']));
  }

  navegarAEstudiantes(): void {
    this.router.navigate(['/auth/register-student']).catch(err => this.router.navigate(['/register-student']));
  }

  navegarAlHome(): void {
    this.router.navigateByUrl('/');
  }
enviarRegistro() {
  if (this.empresaForm.valid) {
    const formValues = this.empresaForm.value;
    const datosEmpresa = {
      nit: formValues.nit,
      correo: formValues.correo,
      direccion: formValues.direccion.trim(),
      telefono: formValues.telefono,
      contrasena: formValues.contrasena,
      rol: 'Empresa',
      razon_social: formValues.razonSocial,
      sector_economico: formValues.sectorEconomico
    };

    console.log('Enviando datos estructurados al Backend...', datosEmpresa);

    this.http.post(this.API_URL, datosEmpresa).subscribe({
      next: (respuesta) => {
        alert('🎉 ¡Empresa registrada y guardada con éxito en la Base de Datos!');
        this.empresaForm.reset();
        this.router.navigateByUrl('/auth/login');
      },
      error: (error) => {
        console.error('Error detallado devuelto por el servidor:', error);
        alert('❌ Error interno en el Servidor (500): El backend recibió los datos pero MySQL rechazó el guardado. Revisa la consola de tu Node.js.');
      }
    });
  } else {
    alert('Por favor, rellene todos los campos obligatorios correctamente.');
  }
}

  soloNit(event: KeyboardEvent): boolean {
    const regex = /^[0-9-]$/;
    if (!regex.test(event.key)) { event.preventDefault(); return false; }
    return true;
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const regex = /^[0-9]$/;
    if (!regex.test(event.key)) { event.preventDefault(); return false; }
    return true;
  }
}