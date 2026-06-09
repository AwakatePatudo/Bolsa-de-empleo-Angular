import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './modules/auth/components/home/home';
import { RegistroEstudiante } from './modules/auth/components/register-student/register-student';
import { LoginComponent } from './modules/auth/components/login/login.component'; 
import { EmpresaDashboard } from './componentes/empresa-dashboard/empresa-dashboard';
import { AdminDashboardComponent } from './modules/admin/admin-dashboard/admin-dashboard';
import { EstudianteDashboardComponent } from './modules/estudiante-dashboard/estudiante-dashboard';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register-student', component: RegistroEstudiante },
  { path: 'auth/register-company', loadComponent: () => import('./modules/auth/components/register-company/register-company').then(m => m.RegisterCompany) },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'empresa/dashboard', component: EmpresaDashboard },
  { path: 'empresa/perfil', component: Home },
  { path: 'estudiante/perfil', component: Home },
  { path: 'estudiante/dashboard', component: EstudianteDashboardComponent },
  { 
    path: 'jobs', 
    loadChildren: () => import('./modules/jobs/jobs-module').then(m => m.JobsModule) 
  },
  
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }