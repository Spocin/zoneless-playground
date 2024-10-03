import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'templateLiteralFormatter',
  standalone: true
})
export class TemplateLiteralFormatterPipe implements PipeTransform {

  transform(value: string): string {
	const modifiedStr = value
		.split('\n')
		.map(line => line.trim())
		.join('\n')
		.trim();

	return modifiedStr;
  }
}
