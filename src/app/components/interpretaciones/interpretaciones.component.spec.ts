import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterpretacionesComponent } from './interpretaciones.component';

describe('InterpretacionesComponent', () => {
  let component: InterpretacionesComponent;
  let fixture: ComponentFixture<InterpretacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterpretacionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterpretacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
