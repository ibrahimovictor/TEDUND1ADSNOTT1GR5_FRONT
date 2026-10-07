import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenciaForm } from './referencia-form';

describe('ReferenciaForm', () => {
  let component: ReferenciaForm;
  let fixture: ComponentFixture<ReferenciaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenciaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferenciaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
