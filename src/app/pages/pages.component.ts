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
      { label: 'Панель инструментов', icon: 'pi pi-chart-bar', routerLink: ['/pages/analyze'] },
      { label: 'Категории', icon: 'pi pi-list', routerLink: ['/pages/categories'] },
      { label: 'Пользователи', icon: 'pi pi-users', routerLink: ['/pages/users'] }
    ];
  }

}
