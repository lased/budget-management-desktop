import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesAnalyzeComponent } from './categories.component';

describe('CategoriesAnalyzeComponent', () => {
  let component: CategoriesAnalyzeComponent;
  let fixture: ComponentFixture<CategoriesAnalyzeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoriesAnalyzeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriesAnalyzeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
