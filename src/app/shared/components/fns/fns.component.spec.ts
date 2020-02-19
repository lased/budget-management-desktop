import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FnsComponent } from './fns.component';

describe('FnsComponent', () => {
  let component: FnsComponent;
  let fixture: ComponentFixture<FnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
