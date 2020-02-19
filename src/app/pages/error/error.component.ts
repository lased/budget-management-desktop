import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  type: string;
  message: string;

  constructor(
    private activatedRoute: ActivatedRoute
  ) {
    this.type = this.activatedRoute.snapshot.params.type;
    this.message = this.activatedRoute.snapshot.params.message;
  }

  ngOnInit() {
  }

}
