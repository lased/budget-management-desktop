import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { InputType } from './input.interface';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html'
})
export class InputComponent implements OnInit {
  @Input() label = '';
  @Input() placeholder: string;
  @Input() mask: string;
  @Input() optionLabel: string;

  private _type: InputType = 'text';
  @Input()
  get type(): InputType {
    return this._type;
  }
  set type(value: InputType) {
    if (value && (
      value === 'text' || value === 'select' ||
      value === 'datetime' || value === 'number' ||
      value === 'textarea' || value === 'password' || 'daterange'
    )) {
      this._type = value;
    } else {
      throw Error('InputComponent Error: invalid type value!');
    }
  }

  private _options: SelectItem[] | any[];
  @Input()
  get options(): SelectItem[] | any[] {
    return this._options;
  }
  set options(values: SelectItem[] | any[]) {
    if (
      this.optionLabel || !values.length ||
      'label' in values[0] && 'value' in values[0]
    ) {
      this._options = values;
    } else {
      throw Error('InputComponent Error: invalid type options!');
    }
  }

  private _control: FormControl;
  @Input()
  get control(): FormControl {
    if (this._control && this._control instanceof FormControl) {
      return this._control;
    } else {
      throw Error('InputComponent Error: invalid control value!');
    }
  }
  set control(value: FormControl) {
    if (value && value instanceof FormControl) {
      this._control = value;
    } else {
      throw Error('InputComponent Error: invalid control value!');
    }
  }

  @Output() selected = new EventEmitter();

  ru: any;

  ngOnInit() {
    this.ru = {
      firstDayOfWeek: 1,
      dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    };
  }

  selectedOption(event: any) {
    this.selected.emit(event);
  }

  getMessage() {
    let message: string;

    if (this.control.hasError('required')) {
      message = 'Данное поле обязательно для заполнения';
    } else if (this.control.hasError('min')) {
      const min = this.control.errors.min.min;

      message = `Данное поле не должно быть меньше ${min}`;
    } else if (this.control.hasError('maxlength')) {
      const maxLength = this.control.errors.maxlength.requiredLength;

      message = `Количество символов в поле не должно превышать ${maxLength}`;
    } else if (this.control.hasError('email')) {
      message = 'Введите корректный email';
    }

    return message;
  }
}
