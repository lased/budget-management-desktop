import { NgModule } from '@angular/core';

import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PagesComponent } from './pages.component';

@NgModule({
  declarations: [PagesComponent],
  imports: [
    SharedModule,
    PagesRoutingModule
  ]
})
export class PagesModule { }
