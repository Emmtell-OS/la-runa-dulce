import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProcessLotesService {

  private pathFile = 'assets/';
  private fileName = 'lotes.json';
  private defaultType = 'application/JSON';
  constructor() { }


  public async getFile() {
    const response = await fetch(this.pathFile);
    const data = await response.blob();
    return new File([data], this.fileName, {
    type: data.type || this.defaultType,
  });
  }

}
