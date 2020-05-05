import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';

import { Category } from '@core/models/category';
import { RecordType } from '@core/interfaces';

@Component({
  selector: 'app-category-manage',
  templateUrl: './manage.component.html'
})
export class CategoryManageComponent implements OnInit {
  form: FormGroup;
  error: string;

  type: RecordType;
  category: Category;
  edit: boolean;
  parent: boolean;

  constructor(
    public config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder
  ) {
    this.type = this.config.data.type;
    this.category = this.config.data.category;
    this.edit = this.config.data.edit;
    this.parent = this.config.data.parent;
  }

  ngOnInit() {
    const form = { name: '' };

    if (this.edit) {
      form.name = this.category.name;
    }

    this.form = this.fb.group({
      name: [form.name, [Validators.required, Validators.maxLength(64)]]
    });
  }

  save() {
    const form = this.form.value;
    const where = {
      type: this.type,
      name: form.name,
      parentId: null
    };
    let category = new Category();

    if (this.category) {
      if (this.edit) {
        if (this.category.name === form.name) {
          this.close();

          return;
        }

        category = this.category;
      } else {
        if (!this.parent) {
          category.parentId = where.parentId = this.category.id;
        }
      }
    }

    category.type = this.type;
    category.name = form.name;
    Category.findOne({
      where
    }).then((ctg: Category) => {
      if (ctg) {
        this.error = 'Данное имя уже существует';
      } else {
        this.close(category);
      }
    });
  }

  close(ctg?: Category) {
    this.ref.close(ctg);
  }
}
