import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { RoutesPanelComponent } from "./components/routes-panel.component";
import { MatRipple } from "@angular/material/core";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RoutesPanelComponent, RouterLink, MatRipple],
  template: `
    <h1 matRipple routerLink="" class="app-title">Welcome to {{ title }}!</h1>
    
    <app-routes-panel/>

    <div class="content">
      <router-outlet/>
    </div>
  `,
  styles: `
    :host {
      height: 100%;
      
      display: flex;
      flex-flow: column nowrap;
      gap: 1rem;
      
      padding: 1rem;
      
      box-sizing: border-box;
    }
    
    .app-title {
      width: fit-content;
      cursor: pointer;
      padding: 0.5rem 0.5rem 2rem 0.5rem;
      margin: 0;
      border-radius: 10px;
    }
    
    .content {
      height: 100%;
      
      padding: 0.5rem;
      border-radius: 10px;
      
      background-color: var(--mat-app-background-color);
    }
  `,
})
export class AppComponent {
  title = 'zoneless-playground';
}
