import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html',
  styleUrls: ['./analyze.component.scss']
})
export class AnalyzeComponent implements OnInit {
  items: MenuItem[];

  constructor() { }

  ngOnInit() {
    this.items = [
      { label: 'Расходы и доходы', routerLink: ['/pages/analyze/expenses-and-incomes'] },
      { label: 'По категориям', routerLink: ['/pages/analyze/categories'] },
      { label: 'Товары и услуги', routerLink: ['/pages/analyze/products'] },
      { label: 'Прогнозирование', routerLink: ['/pages/analyze/forecast'] }
    ];
  }
}
