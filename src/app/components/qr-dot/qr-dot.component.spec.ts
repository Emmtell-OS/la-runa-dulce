import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrDotComponent } from './qr-dot.component';

describe('QrDotComponent', () => {
  let component: QrDotComponent;
  let fixture: ComponentFixture<QrDotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QrDotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QrDotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
