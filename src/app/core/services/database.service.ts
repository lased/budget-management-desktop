import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Sequelize, Options } from 'sequelize';
import * as fs from 'fs';

import { environment } from 'src/environments/environment';
import { Config } from '../config';
import * as User from '../models/user';
import * as Category from '../models/category';
import * as Record from '../models/record';
import * as Product from '../models/product';
import * as QrStorage from '../models/qr-storage';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  connection: Sequelize;

  constructor(
    private router: Router
  ) { }

  init() {
    const options: Options = {
      dialect: 'sqlite',
      storage: Config.db
    };

    if (environment.production) {
      options.logging = false;
    }

    try {
      if (!fs.existsSync(Config.root)) {
        fs.mkdirSync(Config.root);
      }
    } catch (err) {
      this.router.navigate(['error', 'fs', 'dir']);
    }

    this.connection = new Sequelize(options);
    this.connection
      .authenticate()
      .catch(err => {
        this.router.navigate(['error', 'db', 'connection']);
      });

    User.init(this.connection);
    Category.init(this.connection);
    Product.init(this.connection);
    Record.init(this.connection);
    QrStorage.init(this.connection);
  }
}
