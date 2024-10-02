import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reductor'
})
export class ReductorPipe implements PipeTransform {

  transform(value: string, limit = 50): string {
    return (value.length > limit) ? `.${value.slice(43, 88)}...` : value;
  }

}
