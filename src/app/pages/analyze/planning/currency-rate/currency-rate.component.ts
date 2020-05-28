import { Component, OnInit } from '@angular/core';
import { Op, Sequelize } from 'sequelize';
import { switchMap } from 'rxjs/operators';
import { Message } from 'primeng/api';

import { Record } from '@core/models/record';
import { Product } from '@core/models/product';
import { Helpers } from '@core/helpers.class';
import { CurrencyData, CbrService } from '@core/services/cbr.service';

@Component({
  selector: 'app-planning-currency-rate',
  templateUrl: './currency-rate.component.html',
  styleUrls: ['./currency-rate.component.scss']
})
export class PlanningCurrencyRateComponent implements OnInit {
  helpers = Helpers;
  loading = true;
  inflation = [];
  currencyData: CurrencyData;
  analyzePercent: number;
  currencyMessage: Message[] = [];
  productsMessage: Message[] = [];

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
      this.setMessages();
      this.loading = false;
    });
  }

  setMessages() {
    this.currencyMessage.push({
      severity: this.analyzePercent > 0 ? 'warn' : 'info',
      summary: 'По данным курса доллара:',
      detail: `возможно ${
        this.analyzePercent > 0 ? 'повышение' : 'снижение'
        } цен импортных товаров на ${this.helpers.formatNumber(Math.abs(this.analyzePercent))}%`
    });

    if (this.inflation[0] !== 0) {
      this.productsMessage.push({
        severity: this.inflation[0] > 0 ? 'warn' : 'info',
        summary: 'По данным товаров и услуг:',
        detail: `цены в среднем стали ${
          this.inflation[0] > 0 ? 'больше' : 'меньше'} на ${this.helpers.formatCurrency(Math.abs(this.inflation[1]))}
          (${this.helpers.formatNumber(Math.abs(this.inflation[0]))}%)`
      });
    }
  }

  getArrowClassName(value: number) {
    return value >= 0
      ? 'currency-rate__arrow--up'
      : 'currency-rate__arrow--down';
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

    return [percent || 0, (oldPrice * percent / 100) / counter || 0];
  }

}
