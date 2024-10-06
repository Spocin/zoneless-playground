import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButton } from "@angular/material/button";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators, } from "@angular/forms";
import { bufferCount, finalize, interval, map, Observable, of, Subscription, switchMap, take, tap } from "rxjs";
import { AsyncPipe, JsonPipe, NgClass } from "@angular/common";

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
	NgClass,
  ],
  template: `
      <form class="form">
          <div class="form__toolbar">
              <button mat-raised-button [disabled]="!form.valid || saving$()" (click)="onSave()">Save form!</button>
          </div>

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
              <span>{{ form.errors | json }}</span>
          }
      </form>

      <div class="debug-panel">
          <h3 class="debug-panel__title">Debug panel</h3>

          <div class="debug-panel__item">
              <span class="debug-panel__item__label">Saving$:&nbsp;</span>
              <span class="debug-panel__item__content"> {{ saving$() }}</span>
          </div>

          <div class="debug-panel__item">
              <span class="debug-panel__item__label">Whole form status:&nbsp;</span>
              <span class="debug-panel__item__content"> {{ form.statusChanges | async }}</span>
          </div>

          <div class="debug-panel__stream">
              <span>
				  @let areCallsPending = isAnyCallPending$() ;
                  Calls
					<div class="debug-panel__stream__status"
                         title="{{ areCallsPending ? 'Calls pending' : 'No pending calls' }}"
                         [ngClass]="{ 'debug-panel__stream__status--pending': areCallsPending}">
					</div>
			  </span>
              @for (call of debugStream$(); let ev = $even; track $index) {
                  <code class="debug-panel__stream__record"
                        [ngClass]="{ 'debug-panel__stream__record--even': ev }">{{ call | json }}</code>
              }
          </div>
      </div>
  `,
  styles: `
    :host {
      padding: 0.5rem 0;

      display: flex;
      flex-flow: column nowrap;
      gap: 2rem;

      flex: 1 1 auto;
    }

    .form {
      display: flex;
      flex-flow: row wrap;
      gap: 1rem;

      &__toolbar {
        flex-basis: 100%;

        display: flex;
        flex-flow: row nowrap;
        align-content: center;
        justify-content: flex-end;
      }

      &__field {
        flex: 1 1 40%;

        &--strangeOne {
          flex-basis: 100%;
        }
      }
    }

    .debug-panel {
      display: flex;
      flex-flow: column nowrap;
      gap: 1rem;

      flex: 1 1 auto;
      border-radius: 10px;
      padding: 1rem;

      background-color: color-mix(in srgb, var(--mat-app-background-color), #000 5%);

      max-height: 55vh;
      overflow-y: auto;

      &__title {
        margin-bottom: 1rem;
      }

      &__item {
        &__content {
          font-weight: bold;
        }
      }

      &__stream {
        display: flex;
        flex-flow: column nowrap;
        gap: 0.5rem;

        &__record {
          padding-left: 5px;
          font-size: small;

          &--even {
            background-color: color-mix(in srgb, var(--mat-app-background-color), #000 10%);
          }
        }

        &__status {
          display: inline-block;
          width: 15px;
          aspect-ratio: 1 / 1;

          border-radius: 50%;
          background-color: red;

          vertical-align: middle;

          &--pending {
            background-color: green;
          }
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AsyncValidatorOnFormComponent {
  protected saving$ = signal(false);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected form = this.fb.group({
	firstName: this.fb.control('', Validators.required),
	middleName: '',
	lastName: this.fb.control('', Validators.required),
	email: this.fb.control('', [Validators.required, Validators.email]),
	asyncValidateField: this.fb.control({ value: '', disabled: true }, null, [this.someFieldValidator()])
  }, { asyncValidators: [this.wholeFormAsyncValidator()] });

  protected async onSave() {
	const wholeFormValidationRes = await this.wholeFormAsyncValidator()();
	console.log(`Form has been validated to with result: ${JSON.stringify(wholeFormValidationRes)}`);

	if (wholeFormValidationRes) {
	  this.form.setErrors(wholeFormValidationRes);
	}
  }

  /**
   * NOTE
   * No `this` context is available here as this function is passed.
   *
   * FIXME I found no way to create validator on whole form that will unsubscribe only when targeted control changes.
   * FIXME #1 Call validator every time form changes.
   * 	      This will make a lot of redundant calls.
   *
   * FIXME #2 Cache the value of the targeted control (only after validator returned some result) and trigger
   * 		  validation only new value does not match cached one.
   *		  If cache was to be updated before call to validator it might return incorrect state. Validation might
   *		  get interrupted but cached value was already updated. So any feature calls will not even trigger
   *		  validation.
   *
   * TODO Make this work
   *
   * Validates {@link asyncValidateField};
   * @private
   */
  private wholeFormAsyncValidator() {
	let asyncValidateFieldCache: typeof this.form.value.asyncValidateField | null = null;

	/**
	 * NOTE
	 *	Despite this function being passed,
	 * `this` context is available here as arrow functions have their own bindings to `this`.
	 */
	return (): Observable<ValidationErrors | null> => {
	  const {
		value,
		errors
	  } = this.form.controls.asyncValidateField;

	  // Trigger validation only when target field changes.
	  if (value === asyncValidateFieldCache) {
		this.addMessage(`Form value didn't change. No need to revalidate.`)
		return of(null);
	  }

	  /* NOTE
	  * 	We must return Observable that actually does the validation in order to let Angular handle
	  * 	unsubscribing from that observable.
	  * */
	  return this.someFieldValidator()()
		.pipe(tap(res => {
		  //Cache value that was validated
		  asyncValidateFieldCache = value.valueOf();

		  if (!res) {
			return;
		  }

		  /* Debug to indicate that some call returned Error */
		  this.addMessage(`Validation of form returned with error: ${JSON.stringify(res)}`);
		  this.addMessage(`Field that was used to validate shouldn't have errors set. Errors: ${JSON.stringify(errors)}`);
		}));
	}
  }

  /**
   * Validates some control for 5 seconds.
   * @private
   */
  private someFieldValidator() {
	/*TODO Add descriptions*/
	return (): Observable<ValidationErrors | null> => {
	  const validatorCall = new ValidatorCall({
		timestamp: Date.now(),
		callIdx: this.currCallIdx,
		message: '',
		state: 'PENDING',
	  });

	  this.addCall(validatorCall);
	  this.currCallIdx += 1;

	  return of(null)
		.pipe(
		  switchMap(() => {
			let secondsToWait = 5;
			const totalWaitTime = secondsToWait;

			return interval(1000)
			  .pipe(
				map(() => secondsToWait),
				tap((count) => this.updateCall(validatorCall, { message: `Waiting ${count} seconds...` })),
				tap(() => secondsToWait -= 1),
				take(totalWaitTime),
				bufferCount(totalWaitTime),
			  );
		  }),
		  map(() => {
			//Mock some validation fail
			if (validatorCall.callIdx === 7 || validatorCall.callIdx == 10) {
			  this.updateCall(validatorCall, {
				message: '',
				state: 'COMPLETED',
				result: { error: `error on call: ${validatorCall.callIdx}` },
			  });
			} else {
			  validatorCall.result = null;
			  this.updateCall(validatorCall, {
				message: '',
				state: 'COMPLETED',
				result: null,
			  });
			}

			return validatorCall.result ?? null;
		  }),
		  finalize(() => validatorCall.result === undefined ? this.updateCall(validatorCall, { state: 'ABORTED', message: 'Aborted' }) : undefined),
		);
	};
  }

  /* DEBUG ONLY THINGS FROM HERE ON*/
  private currCallIdx = 0;
  private calls$ = signal<IValidatorCall[]>([]);
  private messages$ = signal<ISimpleMessage[]>([]);

  protected debugStream$ = computed(() => {
	const stream: MessageTypes[] = [...this.calls$(), ...this.messages$()];
	stream.sort((a, b) => a.timestamp - b.timestamp);

	return stream;
  });

  protected isAnyCallPending$ = computed(() => {
	return this.debugStream$()
		.filter((el): el is ValidatorCall => el instanceof ValidatorCall)
		.some(el => el.result === undefined && el.state !== 'ABORTED')
  });

  private addCall(call: IValidatorCall) {
	this.calls$.update(calls => {
	  calls.push(call);
	  return calls;
	});
  }

  private updateCall(call: IValidatorCall, updates: Partial<IValidatorCall>): IValidatorCall {
	Object.assign(call, updates);
	this.calls$.update((calls) => [...calls]);
	return call;
  }

  private addMessage(message: string) {
	this.messages$.update((messages) => {
	  messages.push(new SimpleMessage({ timestamp: Date.now(), message }));
	  return messages;
	});
  }
}

export interface Message {
  timestamp: number
}

export type MessageTypes = ValidatorCall | SimpleMessage;

export type CallState = 'PENDING' | 'COMPLETED' | 'ABORTED';

export interface IValidatorCall extends Message {
  callIdx: number
  message: string
  result?: ValidationErrors | null
  subscription?: Subscription
  state: CallState
}

export interface ISimpleMessage extends Message {
  message: string
}

export class ValidatorCall implements IValidatorCall {
  callIdx!: number;
  message!: string;
  result: ValidationErrors | null | undefined;
  timestamp!: number;
  state!: CallState;

  constructor(dto: IValidatorCall) {
	Object.assign(this, dto);
  }
}

export class SimpleMessage implements ISimpleMessage {
  message!: string;
  timestamp!: number;

  constructor(dto: ISimpleMessage) {
	Object.assign(this, dto);
  }
}
