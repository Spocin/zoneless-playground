import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton } from "@angular/material/button";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import {
    AbstractControl,
    AsyncValidatorFn,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from "@angular/forms";
import { BehaviorSubject, interval, lastValueFrom, map, takeWhile, tap } from "rxjs";
import { AsyncPipe, JsonPipe } from "@angular/common";

@Component({
    selector: 'app-async-validator-on-form',
    standalone: true,
    imports: [
        MatButton,
        MatFormField,
        MatLabel,
        MatInput,
        ReactiveFormsModule,
        AsyncPipe,
        MatError,
        JsonPipe,
    ],
    template: `
        <div class="toolbar">
            <span class="toolbar__debug">{{ debug$ | async }}</span>
            <button mat-raised-button [disabled]="!form.valid || saving$()" (click)="onSave()">Save form!</button>
        </div>

        <form class="form">
            <mat-form-field class="form__field">
                <mat-label>First name</mat-label>
                <input matInput [formControl]="form.controls.firstName">
                <mat-error/>
            </mat-form-field>

            <mat-form-field class="form__field">
                <mat-label>Middle name</mat-label>
                <input matInput [formControl]="form.controls.middleName">
                <mat-error/>
            </mat-form-field>

            <mat-form-field class="form__field">
                <mat-label>Last name</mat-label>
                <input matInput [formControl]="form.controls.lastName">
                <mat-error/>
            </mat-form-field>

            <mat-form-field class="form__field">
                <mat-label>Email</mat-label>
                <input matInput [formControl]="form.controls.email">
                <mat-error/>
            </mat-form-field>

            <mat-form-field class="form__field form__field--strangeOne">
                <mat-label>Async validate field</mat-label>
                <input matInput [formControl]="form.controls.asyncValidateField">
                <mat-error/>
            </mat-form-field>

            @if (form.errors) {
                <span>Form errors: {{ form.errors | json }}</span>
            }
        </form>
    `,
    styles: `
      :host {
        padding: 0.5rem 0;

        display: flex;
        flex-flow: column wrap;
        gap: 2rem;
      }

      .toolbar {
        display: flex;
        flex-flow: row nowrap;
        align-content: center;
        justify-content: space-between;
      }

      .form {
        display: flex;
        flex-flow: row wrap;
        gap: 1rem;

        &__field {
          flex: 1 1 40%;

          &--strangeOne {
            flex-basis: 100%;
          }
        }
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AsyncValidatorOnFormComponent {
    private readonly fb = inject(FormBuilder).nonNullable;

    protected form = this.fb.group({
        firstName: this.fb.control('', Validators.required),
        middleName: '',
        lastName: this.fb.control('', Validators.required),
        email: this.fb.control('', [Validators.required, Validators.email]),
        asyncValidateField: this.fb.control({value: '', disabled: true}, null, [this.someFieldValidator()])
    }, {asyncValidators: [this.wholeFormAsyncValidator()]});

    protected saving$ = signal(false);
    protected debug$ = new BehaviorSubject('...debug...');

    private calls = 0;

    protected async onSave() {
        const wholeFormValidationRes = await this.wholeFormAsyncValidator()(this.form);
        console.log(`Form has been validated to with result: ${JSON.stringify(wholeFormValidationRes)}`);

        if (wholeFormValidationRes) {
            this.form.setErrors(wholeFormValidationRes);
        }
    }

    /**
     * Validates {@link asyncValidateField};
     * @private
     */
    private wholeFormAsyncValidator(): AsyncValidatorFn {
        /*TODO No switchMap mechanic on this call*/

        return async (control: AbstractControl): Promise<ValidationErrors | null> => {
            //Couldn't figure out better way to keep type system. It is loose end.
            const asyncValidateField = (control as unknown as typeof this.form).controls.asyncValidateField;

            const validationRes: ValidationErrors | null = await this.someFieldValidator()(asyncValidateField);

            if (!validationRes) {
                return null;
            }

            console.log(`Validation of form returned: ${JSON.stringify(validationRes)}`);
            console.log(`Field that was used to validate shouldn't have errors set`, asyncValidateField.errors);

            return validationRes;
        }
    }

    /**
     * Validates some control for 5 seconds.
     * @private
     */
    private someFieldValidator(): AsyncValidatorFn {
        return async (control: AbstractControl): Promise<ValidationErrors | null> => {
            const call = this.calls;
            this.calls += 1;

            this.logDebug('Validating...');

            let secondsToWait = 5;
            const sleeper$ = interval(1000)
                .pipe(
                    map(() => secondsToWait),
                    tap((count) => this.logDebug(`Waiting ${count} seconds...`)),
                    tap(() => secondsToWait -= 1),
                    takeWhile((count) => count !== 0)
                );

            await lastValueFrom(sleeper$);

            this.logDebug('Validated! No errors');

            //Mock some validation fail
            if (call === 7 || call == 10) {
                return { error: `error ${call}` };
            }

            return null;
        }
    }

    private logDebug(message: string) {
        console.log(message);
        this.debug$.next(message);
    }
}
