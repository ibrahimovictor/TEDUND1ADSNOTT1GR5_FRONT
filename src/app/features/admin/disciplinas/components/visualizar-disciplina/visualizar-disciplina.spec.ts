import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarDisciplina } from './visualizar-disciplina';

describe('VisualizarDisciplina', () => {
  let component: VisualizarDisciplina;
  let fixture: ComponentFixture<VisualizarDisciplina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarDisciplina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizarDisciplina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
