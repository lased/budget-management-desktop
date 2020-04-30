import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';

import { InputComponentOptions } from '@shared/components/input/input.interface';
import { Helpers } from '@core/helpers.class';
import { Product } from '@core/models/product';

@Component({
  selector: 'app-product-manage',
  templateUrl: './manage.component.html'
})
export class ProductManageComponent implements OnInit {
  helpers = Helpers;

  form: FormGroup;
  formInputs: InputComponentOptions[];
  product: Product;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    const product = this.config.data?.product;

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0)]]
    });
    this.formInputs = [
      { label: 'Наименование', control: this.form.controls.name as FormControl, type: 'text' },
      { label: 'Количество', control: this.form.controls.quantity as FormControl, type: 'number' },
      { label: `Цена (${this.helpers.getCurrencySymbol()})`, control: this.form.controls.price as FormControl, type: 'number' }
    ];

    if (product) {
      this.form.disable();
      this.product = product;
      this.form.patchValue({
        name: this.product.name,
        quantity: this.product.quantity,
        price: this.product.price
      });
      this.form.enable();
    }
  }

  fixNumber(form: any) {
    const f = Object.assign({}, form);

    f.quantity = +(Number(this.helpers.getNumber(f.quantity)).toFixed(3));
    f.price = Math.round(this.helpers.getNumber(f.price));

    return f;
  }

  create() {
    const form = this.fixNumber(this.form.value);
    const product = new Product({ ...form });

    this.close(product);
  }

  save() {
    const form = this.fixNumber(this.form.value);
    const product = new Product({ ...this.product, ...form });

    this.close(product);
  }

  close(product?: Product) {
    this.ref.close(product);
  }
}
