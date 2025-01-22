import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntoVentaConsoleComponent } from './punto-venta-console.component';

describe('PuntoVentaConsoleComponent', () => {
  let component: PuntoVentaConsoleComponent;
  let fixture: ComponentFixture<PuntoVentaConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PuntoVentaConsoleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PuntoVentaConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
