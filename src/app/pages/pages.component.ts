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
      { label: 'Анализ', icon: 'pi pi-chart-bar', routerLink: ['/pages/analyze'] }
    ];
  }

}
