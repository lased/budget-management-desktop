import { Component, OnInit } from '@angular/core';
import { Sequelize, Op } from 'sequelize';
import { switchMap } from 'rxjs/operators';

import { CbrService, CurrencyData } from '@core/services/cbr.service';
import { Helpers } from '@core/helpers.class';
import { Product } from '@core/models/product';
import { Record } from '@core/models/record';

@Component({
  selector: 'app-planning-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class PlanningIndicatorsComponent implements OnInit {
  helpers = Helpers;
  loading = true;
  inflation = [];
  currencyData: CurrencyData;
  analyzePercent: number;

  constructor(
    private cbrService: CbrService
  ) { }

  ngOnInit() {
    this.cbrService.getCurrencyRate(new Date()).pipe(
      switchMap(data => {
        this.currencyData = data;
        this.analyzePercent = this.getAnalyzePercent();

        return this.getInflationFromProducts();
      })
    ).subscribe(inf => {
      this.inflation = inf;
      this.loading = false;
    });
  }

  getFormatedCurrency(currency: number, abs = false) {
    return this.helpers.formatCurrency(abs ? Math.abs(currency) : currency);
  }

  getCompareText(num: number, probability = false) {
    return num > 0
      ? probability ? 'повышение' : 'больше'
      : probability ? 'понижение' : 'меньше';
  }

  getClassName(value: number, reverse = false) {
    return 'text ' + (
      reverse && value > 0 ? 'text--red' : 'text--green'
    );
  }

  getAnalyzePercent() {
    const avgPrevMM = (this.currencyData.prev.min + this.currencyData.prev.max) / 2;
    const avgCurrMM = (this.currencyData.current.min + this.currencyData.current.max) / 2;
    const avgPrevFL = (this.currencyData.prev.last + this.currencyData.prev.first) / 2;
    const avgCurrFL = (this.currencyData.current.last + this.currencyData.current.first) / 2;
    const avgPrev = (avgPrevMM + avgPrevFL + this.currencyData.prev.avg) / 3;
    const avgCurr = (avgCurrMM + avgCurrFL + this.currencyData.current.avg) / 3;

    return -(avgPrev - avgCurr) / avgPrev * 100;
  }

  async getInflationFromProducts() {
    const recs: Record[] = await Record.findAll({
      include: [{ model: Product, as: 'products', required: true }],
      where: {
        date: {
          [Op.gte]: Sequelize.fn('datetime', 'now', 'start of month', '-1 month'),
          [Op.lte]: Sequelize.fn('datetime', 'now', 'start of month', '+1 month')
        }
      }
    });
    const now = new Date();
    const currProducts = [];
    const currGroupProducts = {};
    const prevProducts = [];
    const prevGroupProducts = {};
    const group = (obj, p) => {
      if (obj[p.name]) {
        obj[p.name].price = (obj[p.name].price + p.price) / 2;

        return;
      }

      obj[p.name] = p;
    };
    let oldPrice = 0;
    let newPrice = 0;
    let counter = 0;

    recs.forEach(r => {
      if (r.date.getMonth() === now.getMonth()) {
        currProducts.push(...r.products);
      } else {
        prevProducts.push(...r.products);
      }
    });
    currProducts.forEach(group.bind(null, currGroupProducts));
    prevProducts.forEach(group.bind(null, prevGroupProducts));

    for (const name in currGroupProducts) {
      if (currGroupProducts.hasOwnProperty(name)) {
        const product = currGroupProducts[name];

        if (prevGroupProducts[name]) {
          oldPrice += prevGroupProducts[name].price;
          newPrice += product.price;
          counter++;
        }
      }
    }

    const percent = -(oldPrice - newPrice) / oldPrice * 100;

    return [percent, (oldPrice * percent / 100) / counter];
  }
}
