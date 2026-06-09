import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { RegisterCompany } from './components/register-company/register-company';

@NgModule({
  declarations: [
  
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoginComponent,   
    RegisterCompany   
  ]
})
export class AuthModule { }