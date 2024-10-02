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

    <router-outlet/>
  `,
  styles: `
    :host {
      display: flex;
      flex-flow: column nowrap;
      gap: 1rem;
      
      padding: 1rem;
    }
    
    .app-title {
      width: fit-content;
      cursor: pointer;
      padding: 0 0.5rem;
      border-radius: 10px;
    }
  `,
})
export class AppComponent {
  title = 'zoneless-playground';
}
