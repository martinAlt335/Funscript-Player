import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunscriptHeatmapComponent } from './funscript-heatmap.component';

describe('FunscriptGraphComponent', () => {
  let component: FunscriptHeatmapComponent;
  let fixture: ComponentFixture<FunscriptHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FunscriptHeatmapComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunscriptHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
