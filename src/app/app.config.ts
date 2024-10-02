import {
    ApplicationConfig,
    provideExperimentalCheckNoChangesForDebug,
    provideExperimentalZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideExperimentalCheckNoChangesForDebug({ interval: 2000 }),
        provideRouter(routes),
    ]
};
