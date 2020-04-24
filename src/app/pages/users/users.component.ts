import { Component, OnInit } from '@angular/core';
import { DialogService, LazyLoadEvent, DynamicDialogConfig } from 'primeng/api';

import { UserManageComponent } from './manage/manage.component';
import { User } from 'src/app/core/models/user';
import { TableColumn, TableActions } from '@shared/components/table/table.interface';
import { Order } from 'sequelize/types';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  loading = false;

  users: User[];
  userColumns: TableColumn[];
  actionsCallback: TableActions;
  totalUsers: number;
  event: LazyLoadEvent;

  constructor(
    private dialog: DialogService
  ) { }

  ngOnInit() {
    this.actionsCallback = {
      onCreate: () => this.create(),
      onDelete: (user: User) => this.delete(user.id),
      onUpdate: (user: User) => this.update(user.id)
    };
    this.userColumns = [
      { field: 'name', header: 'Пользователь' }
    ];
    this.loading = true;
  }

  onLazyLoad(event: LazyLoadEvent) {
    this.event = event;
    this.getUsers(event);
  }

  getUsers(event: LazyLoadEvent) {
    let order: Order = [['name', 'ASC']];

    if (event.sortField) {
      const sortOrder = event.sortOrder === 1 ? 'ASC' : 'DESC';

      order = [[event.sortField, sortOrder]];
    }

    this.loading = true;
    User.findAndCountAll({
      order,
      limit: event.rows,
      offset: event.first,
      where: {
        main: false
      }
    }).then(({ rows, count }) => {
      this.totalUsers = count;
      this.users = rows;
      this.loading = false;
    });
  }

  create() {
    const header = 'Создание пользователя';

    this.openUserDialog(header);
  }

  update(id: number) {
    const header = 'Редактировать пользователя';
    const data = { id };

    this.openUserDialog(header, data);
  }

  delete(id: number) {
    User.destroy({ where: { id } }).then(_ => this.getUsers(this.event));
  }

  openUserDialog(header: string, data: object = {}) {
    this.dialog.open(UserManageComponent, {
      header,
      data
    }).onClose.subscribe((user: User) => {
      if (user) {
        user.save().then(_ => this.getUsers(this.event));
      }
    });
  }
}
