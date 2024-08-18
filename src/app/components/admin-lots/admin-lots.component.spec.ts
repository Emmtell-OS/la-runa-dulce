import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLotsComponent } from './admin-lots.component';

describe('AdminLotsComponent', () => {
  let component: AdminLotsComponent;
  let fixture: ComponentFixture<AdminLotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminLotsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminLotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
