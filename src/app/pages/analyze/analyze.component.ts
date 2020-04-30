import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { FormControl } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { AnalyzeService } from '../../core/services/analyze.service';

@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html',
  styleUrls: ['./analyze.component.scss'],
  providers: [AnalyzeService]
})
export class AnalyzeComponent implements OnInit, OnDestroy {
  items: MenuItem[];
  periodControl: FormControl;
  currentPath: string;
  subscriptionRouter: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private analyzeService: AnalyzeService
  ) { }

  ngOnInit() {
    const currentDate = new Date();
    const previousDate = new Date();

    previousDate.setMonth(currentDate.getMonth() - 1);
    this.periodControl = new FormControl([previousDate, currentDate]);
    this.analyzeService.setPeriod(this.periodControl.value);
    this.items = [
      { label: 'Доходы и расходы', icon: '', routerLink: ['expenses-and-incomes'] },
      { label: 'Товары и услуги', icon: '', routerLink: ['products'] },
      { label: 'Прогноз', icon: '', routerLink: ['forecast'] },
    ];
    this.currentPath = this.router.url.split('/').slice(-1)[0];
    this.subscriptionRouter = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(_ => this.activatedRoute),
      map(route => {
        while (route.firstChild) { route = route.firstChild; }

        return route;
      }),
      switchMap(route => route.url)
    ).subscribe(([{ path }]) => {
      this.currentPath = path;
    });
  }

  selectedPeriod() {
    this.analyzeService.setPeriod(this.periodControl.value);
  }

  ngOnDestroy() {
    this.subscriptionRouter.unsubscribe();
  }
}
