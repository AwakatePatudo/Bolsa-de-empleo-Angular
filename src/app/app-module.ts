import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { JobsModule } from './modules/jobs/jobs-module'; 
import { AuthModule } from './modules/auth/auth-module'; // <-- NUEVO IMPORT
import { AppComponent } from './app'; 

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    JobsModule,
    AuthModule // <-- LO INYECTAMOS AQUÍ
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }