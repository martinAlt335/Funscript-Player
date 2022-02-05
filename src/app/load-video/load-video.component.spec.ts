import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadVideoComponent } from './load-video.component';

describe('VideoSelectComponent', () => {
  let component: LoadVideoComponent;
  let fixture: ComponentFixture<LoadVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadVideoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
