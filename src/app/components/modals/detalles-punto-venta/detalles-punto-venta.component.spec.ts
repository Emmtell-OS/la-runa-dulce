import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesPuntoVentaComponent } from './detalles-punto-venta.component';

describe('DetallesPuntoVentaComponent', () => {
  let component: DetallesPuntoVentaComponent;
  let fixture: ComponentFixture<DetallesPuntoVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetallesPuntoVentaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetallesPuntoVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
