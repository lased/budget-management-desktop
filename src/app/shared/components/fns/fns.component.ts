import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { FnsService } from 'src/app/core/services/fns.service';
import { TypeFnsForm } from './fns.interface';

@Component({
  selector: 'app-fns-form',
  templateUrl: './fns.component.html',
  styleUrls: ['./fns.component.scss']
})
export class FnsComponent implements OnInit {
  form: FormGroup;

  private _type: TypeFnsForm = 'login';
  @Input()
  get type() {
    return this._type;
  }

  set type(type: TypeFnsForm) {
    this._type = type;
    this.setForm(type);
    this.typeChange.emit(type);
  }

  @Output() close = new EventEmitter();
  @Output() typeChange = new EventEmitter<TypeFnsForm>();
  @Output() success = new EventEmitter<HttpResponse<any>>();
  @Output() error = new EventEmitter<HttpErrorResponse>();

  constructor(
    private fb: FormBuilder,
    private fns: FnsService
  ) { }

  ngOnInit() {
    this.setForm(this.type);
  }

  link(type: TypeFnsForm) {
    this.type = type;
  }

  setForm(type: TypeFnsForm) {
    switch (type) {
      case 'login':
        this.form = this.fb.group({
          password: ['', [Validators.required, Validators.maxLength(64)]],
          phone: ['', [Validators.required]]
        });

        break;
      case 'register':
        this.form = this.fb.group({
          email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
          name: ['', [Validators.required, Validators.maxLength(128)]],
          phone: ['', [Validators.required]]
        });

        break;
      case 'restore':
        this.form = this.fb.group({
          phone: ['', [Validators.required]]
        });

        break;
    }
  }

  save() {
    const values = this.form.value;

    values.phone = values.phone.replace(/[^0-9+]/g, '');

    this.fns[this.type](values).subscribe(
      res => this.success.emit(res),
      err => this.error.emit(err)
    );
  }

  closeEvent() {
    this.close.emit();
  }

}
