import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeToggleButtonComponent } from './theme-toggle-button.component';

describe('ThemeToggleButtonComponent', () => {
  let component: ThemeToggleButtonComponent;
  let fixture: ComponentFixture<ThemeToggleButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThemeToggleButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeToggleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
