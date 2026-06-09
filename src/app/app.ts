import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; 
import { RouterOutlet } from '@angular/router';

@Component({
selector: 'app-root',
standalone: true,
imports: [RouterModule, RouterOutlet], 
templateUrl: './app.html',
styleUrls: ['./app.css']
})
export class App {
title = 'bolsa-empleo';
}