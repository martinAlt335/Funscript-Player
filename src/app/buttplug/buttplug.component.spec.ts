import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ButtplugComponent} from './buttplug.component';

describe('ButtplugComponent', () => {
  let component: ButtplugComponent;
  let fixture: ComponentFixture<ButtplugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtplugComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtplugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
