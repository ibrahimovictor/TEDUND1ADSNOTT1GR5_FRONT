import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessorForm } from './professor-form';

describe('NovoProfessorForm', () => {
  let component: ProfessorForm;
  let fixture: ComponentFixture<ProfessorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessorForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessorForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
