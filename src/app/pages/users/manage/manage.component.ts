import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-user-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class UserManageComponent implements OnInit {
  form: FormGroup;
  error: string;
  user: User;

  constructor(
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    const id = this.config.data.id;

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(64)]]
    });

    if (id) {
      this.form.disable();
      User.findByPk(id).then((usr: User) => {
        this.user = usr;
        this.form.patchValue({
          name: usr.name
        });
        this.form.enable();
      });
    }
  }

  save() {
    let user: User = new User();

    if (this.user) {
      user = this.user;

      if (this.user.name === this.form.value.name) {
        this.close();
      }
    }

    user.name = this.form.value.name;
    User.findOne({ where: { name: user.name } }).then((usr: User) => {
      if (usr) {
        this.error = 'Данный пользователь уже существует';
      } else {
        this.close(user);
      }
    });
  }

  close(user?: User) {
    this.ref.close(user);
  }
}
