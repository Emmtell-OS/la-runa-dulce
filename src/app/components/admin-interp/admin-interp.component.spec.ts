import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInterpComponent } from './admin-interp.component';

describe('AdminInterpComponent', () => {
  let component: AdminInterpComponent;
  let fixture: ComponentFixture<AdminInterpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminInterpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminInterpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
