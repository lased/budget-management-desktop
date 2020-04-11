import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/api';

import { UserManageComponent } from './manage/manage.component';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users$: Promise<User[]>;

  constructor(
    private dialog: DialogService
  ) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.users$ = null;
    this.users$ = User.findAll({ where: { main: false } });
  }

  createOrUpdate(id?: number) {
    let data = {};
    let header = 'Создание пользователя';

    if (id) {
      header = 'Редактировать пользователя';
      data = { id };
    }

    this.dialog.open(UserManageComponent, {
      width: '50%',
      header,
      data
    }).onClose.subscribe((user: User) => {
      if (user) {
        user.save().then(_ => this.getUsers());
      }
    });
  }

  delete(id: number) {
    User.destroy({ where: { id } }).then(_ => this.getUsers());
  }
}
