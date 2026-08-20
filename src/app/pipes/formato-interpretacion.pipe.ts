import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoInterpretacion'
})
export class FormatoInterpretacionPipe implements PipeTransform {

  transform(value: string): string {
    return value.slice(0, 50) + "...";
  }

}
