import { Pipe, PipeTransform } from '@angular/core';
import { Message } from "../async-validator-on-form/async-validator-on-form.component";

@Pipe({
  name: 'formatMessage',
  standalone: true
})
export class FormatMessagePipe implements PipeTransform {
  transform(value: Message)  {
    return value.formatPrint();
  }
}
