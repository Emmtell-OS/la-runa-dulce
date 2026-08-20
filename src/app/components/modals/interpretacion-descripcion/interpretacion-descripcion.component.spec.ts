import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterpretacionDescripcionComponent } from './interpretacion-descripcion.component';

describe('InterpretacionDescripcionComponent', () => {
  let component: InterpretacionDescripcionComponent;
  let fixture: ComponentFixture<InterpretacionDescripcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterpretacionDescripcionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterpretacionDescripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
