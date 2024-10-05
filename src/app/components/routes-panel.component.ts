import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatListItem, MatListItemLine, MatListItemMeta, MatListItemTitle, MatNavList } from "@angular/material/list";
import { appRoutes } from "../app.routes";
import { TemplateLiteralFormatterPipe } from "../pipes/template-literal-formatter.pipe";
import { RouterLink } from "@angular/router";
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";

@Component({
  selector: 'app-routes-panel',
  standalone: true,
  imports: [
	MatListItem,
	MatListItemTitle,
	MatListItemLine,
	MatListItemMeta,
	TemplateLiteralFormatterPipe,
	MatNavList,
	RouterLink,
	MatExpansionPanel,
	MatExpansionPanelHeader,
	MatExpansionPanelTitle,
  ],
  template: `
      <mat-expansion-panel>
          <mat-expansion-panel-header>
              <mat-panel-title>
                  <h5 class="panel-title">Available routes</h5>
              </mat-panel-title>
          </mat-expansion-panel-header>
          <mat-nav-list>
              @for (route of Object.entries(appRoutes); track route[0]) {
                  <a [routerLink]="route[1].path">
                      <mat-list-item class="route">
                          <div matListItemTitle class="route__title">
                              <span class="route__title__label">Route:</span> {{ route[0] }}
                          </div>
                          <div matListItemLine class="route__line">{{ route[1].label }}</div>
                          <div matListItemMeta class="route__meta">
                              <pre>{{ route[1].description | templateLiteralFormatter }}</pre>
                          </div>
                      </mat-list-item>
                  </a>
              }
          </mat-nav-list>
      </mat-expansion-panel>
  `,
  styles: `
    .panel-title {
      margin: 0;
    }

    .mat-mdc-list-item .route {
      &__title {
        font-style: italic;

        &__label {
          font-style: normal;
          font-weight: bold;
        }
      }

      &__meta {
        display: flex;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutesPanelComponent {
  protected readonly Object = Object;
  protected readonly appRoutes = appRoutes;
}
