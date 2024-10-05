import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { RoutesPanelComponent } from "./components/routes-panel.component";
import { MatRipple } from "@angular/material/core";
import { Meta } from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RoutesPanelComponent, RouterLink, MatRipple],
  template: `
    <a routerLink="">
      <h1 matRipple class="app-title">Welcome to {{ title }}!</h1>
    </a>

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
      display: flex;
      height: 100%;

      padding: 0.5rem;
      border-radius: 10px;

      background-color: var(--mat-app-background-color);
    }
  `,
})
export class AppComponent implements OnInit {
  private readonly meta = inject(Meta);

  title = 'zoneless-playground';

  public ngOnInit() {
	this.addBaseMetaTags();
  }

  private addBaseMetaTags() {
	this.meta.addTag({ name: 'title', content: 'ZonelessPlayground' });
	this.meta.addTag({ name: 'description', content: 'Experimanetal project to test out zoneless Angular' });
	this.meta.addTag({ name: 'keywords', content: 'zoneless angular exprimental' })
  }
}
