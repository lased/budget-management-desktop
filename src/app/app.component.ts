import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';

import { DatabaseService } from './core/services/database.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  constructor(
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private database: DatabaseService
  ) {
    this.database.init();
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(route => this.activatedRoute),
      map(route => {
        while (route.firstChild) { route = route.firstChild; }

        return route;
      }),
      switchMap(route => route.data)
    ).subscribe(({ title }) => {
      if (title) {
        this.title.setTitle(title);
      }
    });
  }
}
