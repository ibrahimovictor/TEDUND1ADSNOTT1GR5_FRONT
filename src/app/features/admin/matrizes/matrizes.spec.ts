import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Matrizes } from './matrizes';

describe('Matrizes', () => {
  let component: Matrizes;
  let fixture: ComponentFixture<Matrizes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Matrizes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Matrizes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
