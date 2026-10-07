import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaProgramas } from './tabela-programas';

describe('TabelaProgramas', () => {
  let component: TabelaProgramas;
  let fixture: ComponentFixture<TabelaProgramas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaProgramas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaProgramas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
