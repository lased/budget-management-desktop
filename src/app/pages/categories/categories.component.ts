import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectItem, DialogService } from 'primeng/api';

import { Category } from 'src/app/core/models/category';
import { RecordType } from 'src/app/core/interfaces';
import { CategoryManageComponent } from './manage/manage.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  form: FormGroup;
  types: SelectItem[];
  category: Category;
  subcategory: Category;
  categories: SelectItem[];
  subcategories: SelectItem[];

  constructor(
    private fb: FormBuilder,
    private dialog: DialogService
  ) {
    this.types = [
      { label: 'Категории доходов', value: RecordType.income, icon: 'pi pi-angle-double-up', styleClass: 'p-col-6' },
      { label: 'Категории расходов', value: RecordType.expense, icon: 'pi pi-angle-double-down', styleClass: 'p-col-6' },
    ];
  }

  ngOnInit() {
    this.form = this.fb.group({
      type: RecordType.income
    });
    this.getCategories(RecordType.income);
  }

  getCategories(type: RecordType, parentId: number = null) {
    Category
      .findAll({ where: { type, parentId } })
      .then((ctgs: Category[]) => ctgs.map(c => ({ label: c.name, value: c })))
      .then((ctgs: SelectItem[]) => {
        parentId
          ? this.subcategories = ctgs
          : this.categories = ctgs;
      });
  }

  changeType(type: RecordType) {
    this.category = this.subcategory = null;
    this.categories = this.subcategories = null;
    this.getCategories(type);
  }

  selectedCategory(category: Category) {
    if (category.parentId) {
      this.subcategory = category;
    } else {
      this.subcategory = null;
      this.category = category;
      this.getCategories(category.type, category.id);
    }
  }

  createOrUpdateCategory(parent: boolean, category?: Category) {
    const data = {
      type: this.form.value.type as RecordType,
      category: this.category,
      edit: false,
      parent
    };
    const prefix = !parent
      ? 'под'
      : '';
    let header = `Создание ${prefix}категории`;

    if (category) {
      header = `Редактирование ${prefix}категории`;
      data.category = category;
      data.edit = true;
    }

    this.dialog.open(CategoryManageComponent, {
      header,
      data
    }).onClose.subscribe((ctg: Category) => {
      if (ctg) {
        ctg.save().then(_ => {
          if (data.edit) {
            this.updateCategory(parent, ctg);
          } else {
            this.createCategory(parent, ctg);
          }
        });
      }
    });
  }

  getArray(parent: boolean) {
    return parent
      ? this.categories
      : this.subcategories;
  }

  createCategory(parent: boolean, category: Category) {
    const arr = this.getArray(parent);

    arr.push({ label: category.name, value: category });
  }

  updateCategory(parent: boolean, category: Category) {
    let arr = this.getArray(parent);

    arr = arr.map(itm => {
      if ((itm.value as Category).id === category.id) {
        itm.value = category;
        itm.label = category.name;
      }

      return itm;
    });
  }

  deleteCategory(category: Category) {
    Category.destroy({
      where: {
        id: category.id
      }
    }).then(_ => {
      if (!category.parentId) {
        this.category = null;
        this.subcategories = null;
      }

      this.subcategory = null;
      this.getCategories(category.type, category.parentId || null);
    });
  }
}
