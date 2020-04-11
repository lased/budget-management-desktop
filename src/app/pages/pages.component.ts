import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html'
})
export class PagesComponent implements OnInit {
  items: MenuItem[];

  constructor() { }

  ngOnInit() {
    this.items = [
      { label: 'Расходы и доходы', icon: 'pi pi-money-bill', routerLink: ['/pages/records'] },
      { label: 'Категории', icon: 'pi pi-list', routerLink: ['/pages/categories'] },
      { label: 'Пользователи', icon: 'pi pi-users', routerLink: ['/pages/users'] },
      {
        label: 'Анализ',
        icon: 'pi pi-chart-bar',
        items: [
          { label: 'Расходы и доходы', routerLink: ['/pages/analyze/expenses-and-incomes'] },
          { label: 'По категориям', routerLink: ['/pages/analyze/categories'] },
          { label: 'Товары и услуги', routerLink: ['/pages/analyze/products'] },
          { label: 'Прогнозирование', routerLink: ['/pages/analyze/forecast'] }
        ]
      }
    ];
  }

}
