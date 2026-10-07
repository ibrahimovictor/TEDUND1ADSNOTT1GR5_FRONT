import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaReferencias } from './tabela-referencias';

describe('TabelaReferencias', () => {
  let component: TabelaReferencias;
  let fixture: ComponentFixture<TabelaReferencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaReferencias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaReferencias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
