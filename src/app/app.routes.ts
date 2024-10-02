import { Route, Routes } from '@angular/router';

export interface AppRoute extends Route {
    label: string
    description: string
}

export const appRoutes = {
    asyncValidatorOnForm: {
        label: 'Async validator on form',
        description: `
            The goal of this project is to create async validator on a whole form.
            The validator should be triggered when value of the target FormControl changes
            but also when manually when we want to save the form.
            
            The target FormControl can be disabled.
        `,
        path: 'asyncValidatorOnForm',
        loadComponent: () => import('./async-validator-on-form/async-validator-on-form.component'),
    }
} as const satisfies Record<string, AppRoute>;

export const routes: Routes = [
    appRoutes.asyncValidatorOnForm
];
