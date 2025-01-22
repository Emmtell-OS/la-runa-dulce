import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boolean'
})
export class BooleanPipe implements PipeTransform {

  transform(value: boolean): string {
    let estatus = 'Activo';
    (!value) ? estatus = 'Inactivo' : estatus;
    return estatus;
  }

}
