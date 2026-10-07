import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarPrograma } from './visualizar-programa';

describe('VisualizarPrograma', () => {
  let component: VisualizarPrograma;
  let fixture: ComponentFixture<VisualizarPrograma>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarPrograma]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizarPrograma);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
