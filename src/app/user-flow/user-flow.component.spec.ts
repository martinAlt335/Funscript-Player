import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFlowComponent } from './user-flow.component';

describe('UserFlowComponent', () => {
  let component: UserFlowComponent;
  let fixture: ComponentFixture<UserFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
