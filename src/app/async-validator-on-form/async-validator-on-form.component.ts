import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-async-validator-on-form',
  standalone: true,
  imports: [],
  template: `
    <p>
      async-validator-on-form works!
    </p>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AsyncValidatorOnFormComponent {

}
