import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunscriptControllerComponent } from './funscript-controller.component';

describe('FunscriptControllerComponent', () => {
  let component: FunscriptControllerComponent;
  let fixture: ComponentFixture<FunscriptControllerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunscriptControllerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunscriptControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
