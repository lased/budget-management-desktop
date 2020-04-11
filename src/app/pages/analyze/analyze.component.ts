import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html'
})
export class AnalyzeComponent implements OnInit {
  items: MenuItem[];

  constructor() { }

  ngOnInit() { }
}
