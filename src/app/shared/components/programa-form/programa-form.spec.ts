import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaForm } from './programa-form';

describe('ProgramaForm', () => {
  let component: ProgramaForm;
  let fixture: ComponentFixture<ProgramaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
