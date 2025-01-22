import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LpConsoleComponent } from './lp-console.component';

describe('LpConsoleComponent', () => {
  let component: LpConsoleComponent;
  let fixture: ComponentFixture<LpConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LpConsoleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LpConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
