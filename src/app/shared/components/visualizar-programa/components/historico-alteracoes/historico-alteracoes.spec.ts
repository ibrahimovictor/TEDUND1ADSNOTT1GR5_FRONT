import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoAlteracoes } from './historico-alteracoes';

describe('HistoricoAlteracoes', () => {
  let component: HistoricoAlteracoes;
  let fixture: ComponentFixture<HistoricoAlteracoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoAlteracoes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricoAlteracoes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
