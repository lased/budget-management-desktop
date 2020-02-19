import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { UserManageComponent } from './manage/manage.component';

@NgModule({
  declarations: [UsersComponent, UserManageComponent],
  imports: [
    SharedModule,
    UsersRoutingModule
  ],
  entryComponents: [UserManageComponent]
})
export class UsersModule { }
