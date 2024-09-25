import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodiDetailesComponent } from './codi-detailes.component';

describe('CodiDetailesComponent', () => {
  let component: CodiDetailesComponent;
  let fixture: ComponentFixture<CodiDetailesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodiDetailesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodiDetailesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
