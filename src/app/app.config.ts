import {
  ApplicationConfig,
  provideExperimentalCheckNoChangesForDebug,
  provideExperimentalZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
	provideExperimentalZonelessChangeDetection(),
	provideExperimentalCheckNoChangesForDebug({interval: 2000}),
	provideRouter(routes),
	provideAnimationsAsync(),
  ]
};
