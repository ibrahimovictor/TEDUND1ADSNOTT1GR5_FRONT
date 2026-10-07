import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramasDisciplina } from './programas-disciplina';

describe('ProgramasDisciplina', () => {
  let component: ProgramasDisciplina;
  let fixture: ComponentFixture<ProgramasDisciplina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramasDisciplina]
    })

    .compileComponents();

    fixture = TestBed.createComponent(ProgramasDisciplina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
