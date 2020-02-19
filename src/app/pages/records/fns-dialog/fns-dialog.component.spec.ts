import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FnsDialogComponent } from './fns-dialog.component';

describe('FnsDialogComponent', () => {
  let component: FnsDialogComponent;
  let fixture: ComponentFixture<FnsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FnsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FnsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
