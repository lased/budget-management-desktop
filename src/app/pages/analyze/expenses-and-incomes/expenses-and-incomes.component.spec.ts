import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesAndIncomesComponent } from './expenses-and-incomes.component';

describe('ExpensesAndIncomesComponent', () => {
  let component: ExpensesAndIncomesComponent;
  let fixture: ComponentFixture<ExpensesAndIncomesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpensesAndIncomesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesAndIncomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
