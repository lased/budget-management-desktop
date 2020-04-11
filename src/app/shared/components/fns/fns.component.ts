import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { FnsService } from '@core/services/fns.service';
import { TypeFnsForm, FnsRequestError } from './fns.interface';
import { InputComponentOptions } from '../input/input.interface';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface Link {
  type: TypeFnsForm;
  label: string;
  show: () => boolean;
}

@Component({
  selector: 'app-fns-form',
  templateUrl: './fns.component.html',
  styleUrls: ['./fns.component.scss']
})
export class FnsComponent implements OnInit {
  form: FormGroup;
  formInputs: (InputComponentOptions & { show: () => boolean, getControl: () => FormControl })[];
  links: Link[];

  private _type: TypeFnsForm = 'login'
  @Input()
  get type() {
    return this._type;
  }
  set type(type: TypeFnsForm) {
    this._type = type;
    this.setForm(type);
  }

  @Output() closeEvent = new EventEmitter();
  @Output() typeChange = new EventEmitter<TypeFnsForm>();
  @Output() successEvent = new EventEmitter<HttpResponse<any>>();
  @Output() errorEvent = new EventEmitter<FnsRequestError>();

  constructor(
    private fb: FormBuilder,
    private fns: FnsService
  ) { }

  ngOnInit() {
    this.setForm(this.type);
    this.formInputs = [
      {
        show: () => this.type === 'register', label: 'Email',
        getControl: () => this.form.controls.email as FormControl
      },
      {
        show: () => this.type === 'register', label: 'Имя',
        getControl: () => this.form.controls.name as FormControl
      },
      {
        show: () => true, label: 'Номер телефона', placeholder: '+7 (123) 456-78-90',
        getControl: () => this.form.controls.phone as FormControl, mask: '+7 (999) 999-99-99'
      },
      {
        show: () => this.type === 'login', type: 'password', label: 'Пароль',
        getControl: () => this.form.controls.password as FormControl
      },
    ];
    this.links = [
      { type: 'login', label: 'Авторизация', show: () => this.type !== 'login' },
      { type: 'register', label: 'Регистрация', show: () => this.type !== 'register' },
      { type: 'restore', label: 'Забыли пароль?', show: () => this.type !== 'restore' }
    ];
  }

  setType(type: TypeFnsForm) {
    this.type = type;
    this.typeChange.emit(type);
    this.setForm(type);
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
      res => this.successEvent.emit(res),
      (err: FnsRequestError) => this.errorEvent.emit(err)
    );
  }

  close() {
    this.closeEvent.emit();
  }

}
