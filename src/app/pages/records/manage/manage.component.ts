import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { forkJoin, of, from, Observable, throwError } from 'rxjs';
import { SelectItem, MessageService } from 'primeng/api';
import { Transaction } from 'sequelize/types';
import { DialogService } from 'primeng/dynamicdialog';

import { RecordType, QRData, Receipt, ReceiptItem } from 'src/app/core/interfaces';

import { User } from 'src/app/core/models/user';
import { Category } from 'src/app/core/models/category';
import { Record } from 'src/app/core/models/record';
import { Product } from 'src/app/core/models/product';

import { DatabaseService } from 'src/app/core/services/database.service';
import { FnsService } from 'src/app/core/services/fns.service';

import { FnsDialogComponent } from '../fns-dialog/fns-dialog.component';
import { QrDialogComponent } from '../qr-dialog/qr-dialog.component';

@Component({
  selector: 'app-record-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class RecordManageComponent implements OnInit {
  record: Record = new Record();
  types: SelectItem[];
  form: FormGroup;

  users: User[] = [];
  categories: Category[] = [];
  subcategories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private fns: FnsService,
    private db: DatabaseService,
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
      amount: ['', [Validators.required]],
      note: ['', [Validators.maxLength(255)]],
      category: ['', [Validators.required]],
      subcategory: [''],
      user: ['']
    });
    this.form.disable();

    if (id) {
      forkJoin(
        from(Record.findOne({
          where: { id },
          include: [{ model: Product, as: 'products' }]
        })) as Observable<Record>,
        from(User.findAll()) as Observable<User[]>
      ).pipe(
        switchMap(([rec, usrs]) => {
          this.record = rec;
          this.users = usrs;

          return (from(Category.findAll({
            where: {
              type: rec.type,
              parentId: null
            }
          })) as Observable<Category[]>).pipe(
            switchMap(ctgs => {
              this.categories = ctgs;

              return !rec.subcategoryId
                ? of(null)
                : (from(Category.findAll({
                  where: {
                    parentId: rec.categoryId
                  }
                })) as Observable<Category[]>).pipe(
                  tap(subctgs => this.subcategories = subctgs)
                );
            })
          );
        })
      ).subscribe(_ => {
        const products = this.record.products;

        if (products && products.length) {
          this.form.controls.amount.setValidators([
            Validators.required,
            Validators.min(this.sumProducts(products) / 100)
          ]);
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
    } else {
      this.form.controls.type.enable();
    }
  }

  sumProducts(products: Product[]): number {
    return products.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  }

  isExpense() {
    return (this.form.controls.type.value as RecordType) === RecordType.expense;
  }

  changeType(type: RecordType) {
    this.form.disable();
    this.form.controls.type.enable();
    this.form.controls.category.reset();
    this.form.controls.subcategory.reset();
    Promise.all([
      User.findAll() as User[],
      Category.findAll({
        where: {
          type,
          parentId: null
        }
      }) as Category[],
    ]).then(([usrs, ctgs]) => {
      this.users = usrs;
      this.categories = ctgs;
      this.form.patchValue({
        user: usrs.find(u => u.main)
      });
      this.form.enable();
      this.form.controls.subcategory.disable();
    });
  }

  openQrDialog() {
    this.dialog.open(QrDialogComponent, {
      header: 'Сканер'
    }).onClose.subscribe((data: string) => {
      if (data) {
        try {
          const qrData = this.fns.parseQrCode(data);

          this.form.patchValue({
            date: new Date(qrData.t),
            amount: qrData.s / 100
          });
          this.getData(qrData);
        } catch (err) {
          this.message.add({
            life: 10000,
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Некорректный QR код'
          });
        }
      }
    });
  }

  getData(qrData: QRData) {
    const phone = localStorage.getItem('fnsPhone');
    const password = localStorage.getItem('fnsPassword');

    this.fns.login({ phone, password }).pipe(
      catchError(err => {
        this.openAuthDialog(qrData);

        return throwError(err);
      }),
      switchMap(res => this.fns.getData(qrData))
    ).subscribe(
      res => {
        if (res.body) {
          this.parseFnsData(res.body.document.receipt);
        }
      }
    );
  }

  openAuthDialog(qrData: QRData) {
    this.dialog.open(FnsDialogComponent, {
      header: 'ФНС',
      data: {
        type: 'login'
      }
    }).onClose.pipe(
    ).subscribe(
      res => {
        if (res instanceof HttpResponse) {
          this.getData(qrData);
        }
        if (res instanceof HttpErrorResponse) {
          this.openAuthDialog(qrData);
        }
      }
    );
  }

  parseFnsData(receipt: Receipt) {
    const items: ReceiptItem[] = receipt.items;
    const amount = this.form.controls.amount;
    let products = this.record.products;

    if (!products) {
      products = this.record.products = [];
    }

    items.forEach(item => {
      const product = new Product({
        name: item.name.replace(/^[0-9*?]+[\s\.]+/, ''),
        quantity: item.quantity,
        price: item.price
      });
      const existsProduct = products.find(p => p.name === product.name && p.price === product.price);

      if (existsProduct) {
        existsProduct.quantity += product.quantity;
      } else {
        products.push(product);
      }
    });

    amount.setValue((amount.value || 0) + receipt.totalSum / 100);
  }

  selectCategory(category: Category) {
    Category.findAll({
      where: {
        parentId: category.id
      }
    }).then(subctgs => {
      const subctgControl = this.form.controls.subcategory;

      this.subcategories = subctgs;
      subctgControl.reset();

      if (subctgs.length) {
        subctgControl.enable();
      } else {
        subctgControl.disable();
      }
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
    record.amount = values.amount;
    record.type = values.type;
    record.date = values.date;
    record.note = values.note;
    record.subcategoryId =
      values.subcategory
        ? values.subcategory.id
        : null;

    this.saveRecord(record)
      .then(_ => this.close())
      .catch(_ => this.message.add({
        life: 10000,
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Произошла ошибка при сохранении записи'
      }));
  }

  async saveRecord(record: Record) {
    let transaction: Transaction;
    let result: Record;

    try {
      transaction = await this.db.connection.transaction();
      result = await record.save();

      if (this.isExpense() && record.products && record.products.length) {
        const arrSaves = record.products.map(p => {
          p.recordId = result.id;

          return p.save();
        });

        await Promise.all(arrSaves);
      }
      await transaction.commit();
    } catch (err) {
      if (err) {
        await transaction.rollback();
        throw err;
      }
    }
  }

  close() {
    this.location.back();
  }
}
