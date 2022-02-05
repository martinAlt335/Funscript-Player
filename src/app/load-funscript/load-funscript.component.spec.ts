import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadFunscriptComponent } from './load-funscript.component';

describe('LoadFunscriptComponent', () => {
  let component: LoadFunscriptComponent;
  let fixture: ComponentFixture<LoadFunscriptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadFunscriptComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadFunscriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
