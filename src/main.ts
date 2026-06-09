import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app-routing-module';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(), 
    provideRouter(routes)
  ]
}).catch((err: any) => console.error(err));