import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SelectItem, MessageService, DialogService } from 'primeng/api';

import { RecordType, QRData, Receipt, ReceiptItem } from '@core/interfaces';
import { FnsRequestError } from '@shared/components/fns/fns.interface';

import { User } from '@core/models/user';
import { Category } from '@core/models/category';
import { Record } from '@core/models/record';
import { Product } from '@core/models/product';

import { Helpers } from '@core/helpers.class';

import { FnsService } from '@core/services/fns.service';
import { RecordService } from '@core/services/record.service';

import { FnsDialogComponent } from '../fns-dialog/fns-dialog.component';
import { QrDialogComponent } from '../qr-dialog/qr-dialog.component';

@Component({
  selector: 'app-record-manage',
  templateUrl: './manage.component.html',
  providers: [RecordService]
})
export class RecordManageComponent implements OnInit {
  record: Record;
  form: FormGroup;
  qrData: QRData;

  users: User[];
  types: SelectItem[];
  categories: Category[];
  subcategories: Category[];

  helpers = Helpers;

  constructor(
    private fb: FormBuilder,
    private fns: FnsService,
    private recordService: RecordService,
    private location: Location,
    private dialog: DialogService,
    private message: MessageService,
    private activatedRoute: ActivatedRoute
  ) {
    this.types = [
      { label: 'Доход', value: RecordType.income, icon: 'pi pi-angle-double-up', styleClass: 'p-col-6' },
      { label: 'Расход', value: RecordType.expense, icon: 'pi pi-angle-double-down', styleClass: 'p-col-6' },
    ];
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.params.id;

    this.form = this.fb.group({
      type: ['', [Validators.required]],
      date: [new Date(), [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0)]],
      note: ['', [Validators.maxLength(255)]],
      category: ['', [Validators.required]],
      subcategory: [''],
      user: ['']
    });
    this.form.disable();
    this.form.controls.type.enable();
    this.record = this.recordService.getRecord();

    if (id) {
      this.recordService.loadRecord(() => Record.findOne({
        where: { id },
        include: [{ model: Product, as: 'products' }]
      })).then(async () => {
        this.record = this.recordService.getRecord();
        this.users = await this.getUsers();
        this.categories = await this.getCategories(this.record.type);
        this.subcategories = await this.getCategories(this.record.type, this.record.categoryId);

        if (this.record.products?.length) {
          this.setAmountValidators();
        }

        this.form.patchValue({
          type: this.record.type,
          date: this.record.date,
          amount: this.record.amount,
          note: this.record.note,
          user: this.users.find(u => u.id === this.record.userId),
          category: this.categories.find(ctg => ctg.id === this.record.categoryId),
          subcategory: this.subcategories.find(subctg => subctg.id === this.record.subcategoryId)
        });
        this.form.enable();

        if (!this.record.subcategoryId) {
          this.form.controls.subcategory.disable();
        }
      });
    }
  }

  getUsers(): Promise<User[]> {
    return User.findAll();
  }

  getCategories(type: RecordType, parentId?: number): Promise<Category[]> {
    return Category.findAll({
      where: {
        type,
        parentId: parentId || null
      }
    });
  }

  setAmountValidators() {
    const sum = this.sumProducts(this.record.products);

    this.form.controls.amount.setValue(sum);
    this.form.controls.amount.setValidators([
      Validators.required,
      Validators.min(this.sumProducts(this.record.products))
    ]);
  }

  sumProducts(products: Product[]) {
    return Math.floor(products.reduce((acc, curr) => acc + curr.price * curr.quantity, 0) / 100);
  }

  isExpense() {
    return this.form.value.type === RecordType.expense;
  }

  async changeType(type: RecordType) {
    this.form.disable();
    this.form.controls.type.enable();
    this.form.controls.category.reset();
    this.form.controls.subcategory.reset();
    this.users = await this.getUsers();
    this.categories = await this.getCategories(type);
    this.form.patchValue({
      user: this.users.find(u => u.main)
    });
    this.form.enable();
    this.form.controls.subcategory.disable();
  }

  async selectCategory(category: Category) {
    const subctgControl = this.form.controls.subcategory;

    subctgControl.reset();
    this.subcategories = await this.getCategories(this.form.value.type, category.id);
    this.subcategories.length ? subctgControl.enable() : subctgControl.disable();
  }

  createProduct(product: Product) {
    this.recordService.createProduct(product);
    this.setAmountValidators();
  }

  updateProduct(product: { old: Product, new: Product }) {
    this.recordService.updateProduct(product);
    this.setAmountValidators();
  }

  deleteProduct(product: Product) {
    this.recordService.deleteProduct(product);
    this.setAmountValidators();
  }

  openQrDialog() {
    this.dialog.open(QrDialogComponent, {
      header: 'Сканер'
    }).onClose.subscribe((qrData: QRData) => {
      if (qrData) {
        this.qrData = qrData;
        this.getData(this.qrData);
      } else if (qrData === null) {
        this.message.add({
          life: 10000,
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Некорректный QR код'
        });
      }
    });
  }

  getData(qrData: QRData) {
    if (!this.fns.isValid()) {
      this.openAuthDialog();

      return;
    }

    this.fns.login(this.fns.getUserData()).pipe(
      catchError(err => {
        this.message.add({
          life: 10000,
          severity: 'error',
          summary: 'Ошибка',
          detail: err.message
        });
        this.openAuthDialog();

        return throwError(err);
      }),
      switchMap(res => this.fns.getData(qrData))
    ).subscribe(res => {
      if (res.status === 202) {
        this.message.add({
          life: 10000,
          severity: 'info',
          summary: 'Обработка',
          detail: 'Чек найден, но не обработан'
        });
      }

      if (res.body) {
        this.form.patchValue({
          date: new Date(qrData.t),
          amount: (this.form.value.amount || 0) + qrData.s / 100
        });
        this.parseFnsData(res.body.document.receipt);
      }
    });
  }

  openAuthDialog() {
    this.dialog.open(FnsDialogComponent, {
      header: 'ФНС',
      data: {
        type: 'login'
      }
    }).onClose.pipe(
    ).subscribe(
      res => {
        if (res instanceof HttpResponse) {
          this.getData(this.qrData);
        } else if (res instanceof FnsRequestError) {
          this.message.add({
            life: 10000,
            severity: 'error',
            summary: 'Ошибка',
            detail: res.message
          });
          this.openAuthDialog();
        }
      }
    );
  }

  parseFnsData(receipt: Receipt) {
    const items: ReceiptItem[] = receipt.items;

    items.forEach(item => {
      const product = new Product({
        name: item.name.replace(/^[0-9*?]+[\s\.]+/, ''),
        quantity: +(Number(item.quantity).toFixed(2)),
        price: item.price
      });
      const existsProduct = this.record.products.find(p => p.name === product.name && p.price === product.price);

      if (existsProduct) {
        product.quantity += existsProduct.quantity;
        this.recordService.updateProduct({
          old: existsProduct,
          new: product
        });
      } else {
        this.recordService.createProduct(product);
      }
      this.setAmountValidators();
    });
  }

  save() {
    const values = this.form.value;
    let record = new Record();

    if (this.record) {
      record = this.record;
    }

    record.categoryId = values.category.id;
    record.userId = values.user.id;
    record.amount = +(Number(values.amount).toFixed(2));
    record.type = values.type;
    record.date = values.date;
    record.note = values.note;
    record.subcategoryId =
      values.subcategory
        ? values.subcategory.id
        : null;

    this.recordService.save()
      .then(() => { this.close() })
      .catch(() => this.message.add({
        life: 10000,
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Произошла ошибка при сохранении записи'
      }));
  }

  close() {
    this.location.back();
  }
}
