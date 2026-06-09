import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router'; 
import { HttpClient } from '@angular/common/http'; 

@Component({
  selector: 'app-registro-estudiante',
  templateUrl: './register-student.html', 
  styleUrls: ['./register-student.css'], 
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})

export class RegistroEstudiante implements OnInit {
  registroForm!: FormGroup;
  verContrasena = false;
  verConfirmarContrasena = false;

private API_URL = 'http://localhost:3000/api/v1/auth/register-student';

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private http: HttpClient 
  ) {}

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      nombres: ['', [Validators.required]],
      tipoDocumento: ['Cédula de Ciudadanía', [Validators.required]],
      numeroDocumento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      fechaNacimiento: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('contrasena')?.value === g.get('confirmarContrasena')?.value
      ? null : { mismatch: true };
  }

  get f() {
    return this.registroForm.controls;
  }

  soloLetras(campo: string) {
    const control = this.registroForm.get(campo);
    if (control) {
      control.setValue(control.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, ''), { emitEvent: false });
    }
  }

  soloNumeros(campo: string) {
    const control = this.registroForm.get(campo);
    if (control) {
      control.setValue(control.value.replace(/[^0-9]/g, ''), { emitEvent: false });
    }
  }
  enviarRegistro() {
    if (this.registroForm.valid) {
      const datosEstudiante = this.registroForm.value;

      console.log('Enviando datos al servidor Backend...', datosEstudiante);
      this.http.post(this.API_URL, datosEstudiante).subscribe({
        next: (respuesta) => {
          // Si el Backend responde que todo salió bien:
          alert('🎉 ¡Registro guardado con éxito en la Base de Datos!');
          
          this.registroForm.reset(); // Limpiamos campos
          
          // 🚀 PUNTO 2: ¡Redirigimos de inmediato al Login!
          this.router.navigate(['/auth/login']); 
        },
        error: (error) => {
          console.error('Error al conectar con el servidor:', error);
          alert('❌ Hubo un error al conectar con la base de datos. Verifica que tu servidor Backend esté encendido.');
        }
      });
    }
  }

navegarAlLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  navegarAEmpresas() {
    this.router.navigateByUrl('/auth/register-company');
  }

navegarAlHome() {
    window.location.href = '/';
  }
}