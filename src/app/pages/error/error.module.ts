import { NgModule } from '@angular/core';

import { ErrorRoutingModule } from './error-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ErrorComponent } from './error.component';

@NgModule({
  declarations: [ErrorComponent],
  imports: [
    SharedModule,
    ErrorRoutingModule
  ]
})
export class ErrorModule { }
