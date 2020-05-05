import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';

import { Category } from '@core/models/category';
import { InputComponentOptions } from '@shared/components/input/input.interface';
import { Helpers } from '@core/helpers.class';
import { Record } from '@core/models/record';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html'
})
export class PlanningManageComponent implements OnInit {
  form: FormGroup;
  inputs: InputComponentOptions[];
  record: Record;

  constructor(
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.record = this.config.data.record;
    this.form = this.fb.group({
      category: ['', [Validators.required]],
      subcategory: [''],
      plan: ['', [Validators.required, Validators.min(0)]],
    });
    this.form.controls.subcategory.disable();
    this.inputs = [
      {
        type: 'select',
        label: 'Категория',
        options: [],
        optionLabel: 'name',
        control: this.form.controls.category as FormControl,
        selected: this.selectedCategory.bind(this)
      },
      {
        type: 'select',
        label: 'Подкатегория',
        options: [],
        optionLabel: 'name',
        control: this.form.controls.subcategory as FormControl
      },
      {
        type: 'number',
        label: `Плановое значение (${Helpers.getCurrencySymbol()})`,
        control: this.form.controls.plan as FormControl
      }
    ];
    Category.findAll({ where: { parentId: null } }).then(async (cats: Category[]) => {
      this.inputs[0].options = cats;

      if (this.record) {
        this.form.patchValue({
          plan: this.record.subcategory?.plan || this.record.category?.plan || 0,
          category: cats.find(c => c.id === this.record.categoryId),
          subcategory: (await this.selectedCategory(this.record.category)).find(c => c.id === this.record.subcategoryId)
        });
      }
    });
  }

  async selectedCategory(category: Category) {
    const cats: Category[] = await Category.findAll({ where: { parentId: category.id } });

    if (cats.length) {
      if (!this.record.subcategory) {
        const sumPlans = cats.reduce((acc, val) => acc + val.plan, 0);

        this.form.controls.plan.setValidators([Validators.required, Validators.min(sumPlans)]);
      }

      this.inputs[1].options = cats;
      this.form.controls.subcategory.enable();
    } else {
      this.form.controls.subcategory.disable();
    }

    return cats;
  }

  async save() {
    const formValues = this.form.value;
    const pk = formValues.subcategory?.id || formValues.category?.id;
    const recPlan = this.record.subcategory?.plan || this.record.category?.plan || 0;

    if (recPlan === formValues.plan) {
      this.ref.close();

      return;
    }

    const cat: Category = await Category.findByPk(pk);

    cat.plan = +Helpers.getNumber(formValues.plan).toFixed(2);
    this.ref.close(cat);
  }

  close() {
    this.ref.close();
  }
}
