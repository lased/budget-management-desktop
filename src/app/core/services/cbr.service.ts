import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs/operators';
import { of, from, forkJoin } from 'rxjs';
import xml2js from 'xml2js';

import { Helpers } from '@core/helpers.class';

interface CbrCurrencyRecord {
  id: string;
  date: string;
  value: number;
}

export interface PreviousCurrencyData {
  date: {
    month: number;
    year: number;
  };
  min: number;
  avg: number;
  max: number;
  last: number;
  first: number;
}

export interface CurrentCurrencyData {
  date: string;
  min: number;
  avg: number;
  max: number;
  last: number;
  first: number;
  changes: number;
  updateAt: string;
}

export interface CurrencyData {
  current: CurrentCurrencyData;
  prev: PreviousCurrencyData;
}

@Injectable({
  providedIn: 'root'
})
export class CbrService {
  private readonly CBR_API = 'http://www.cbr.ru/scripts/XML_dynamic.asp';
  private currencyCode = 'R01235';

  constructor(
    private http: HttpClient
  ) { }

  getCurrencyRate(date: Date) {
    const currentDate = Helpers.formatDate(date, 'dd.MM.yyyy');
    const currencyData = this.getCurrentDataFromStorage();
    const prev$ = this.getPrevMonthData(date);
    const curr$ = this.getCurrentCurrencyRate(date);
    let query = [];

    if (currencyData) {
      if (
        currencyData.prev.date.month !== date.getMonth() - 1
        || currencyData.prev.date.year !== date.getFullYear()
      ) {
        query = [prev$, of(currencyData.current)];
      }
      if (currencyData.current.updateAt !== currentDate) {
        query = [of(currencyData.current), curr$];
      }
    } else {
      query = [prev$, curr$];
    }

    if (query.length) {
      return forkJoin(query).pipe(
        map((arr: [PreviousCurrencyData, CurrentCurrencyData]) => {
          const currData: CurrencyData = {
            prev: arr[0],
            current: arr[1]
          };

          this.setCurrentDataToStorage(currData);

          return currData;
        })
      );
    } else {
      return of(currencyData);
    }
  }

  getCurrentCurrencyRate(date: Date) {
    const startDate = Helpers.formatDate(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - (10 + date.getDate() - 1)
      ), 'dd/MM/yyyy');
    const endDate = Helpers.formatDate(date, 'dd/MM/yyyy');

    return this.http.get(
      this.CBR_API
      + `?date_req1=${startDate}`
      + `&date_req2=${endDate}`
      + `&VAL_NM_RQ=${this.currencyCode}`,
      { responseType: 'text' }
    )
      .pipe(
        switchMap(xml => from(this.parseXML(xml)).pipe(
          map(recs => {
            const values = recs.map(r => r.value);
            let index = 0;
            let currValues: number[];

            for (; index < recs.length; index++) {
              const rec = recs[index];
              const recDate = new Date(rec.date.split('.').reverse().join('.'));

              if (recDate.getMonth() === date.getMonth()) {
                break;
              }
            }

            currValues = values.slice(index);

            return {
              first: currValues[0],
              updateAt: Helpers.formatDate(date, 'dd.MM.yyyy'),
              date: recs[recs.length - 1].date,
              min: Math.min.apply(null, currValues),
              avg: values.reduce((acc, val) => acc + val, 0) / values.length,
              max: Math.max.apply(null, currValues),
              last: recs[recs.length - 1].value,
              changes: recs[recs.length - 1].value - recs[recs.length - 2].value
            } as CurrentCurrencyData;
          })
        ))
      );
  }

  getPrevMonthData(date: Date) {
    const startDate = Helpers.formatDate(new Date(date.getFullYear(), date.getMonth() - 1, 1), 'dd/MM/yyyy');
    const endDate = Helpers.formatDate(new Date(date.getFullYear(), date.getMonth(), 0), 'dd/MM/yyyy');

    return this.http.get(
      this.CBR_API
      + `?date_req1=${startDate}`
      + `&date_req2=${endDate}`
      + `&VAL_NM_RQ=${this.currencyCode}`,
      { responseType: 'text' }
    ).pipe(
      switchMap(xml => from(this.parseXML(xml)).pipe(
        map(recs => {
          const values = recs.map(r => r.value);

          return {
            min: Math.min.apply(null, values),
            max: Math.max.apply(null, values),
            last: values[values.length - 1],
            avg: values.reduce((acc, val) => acc + val, 0) / values.length,
            first: values[0],
            date: {
              year: date.getFullYear(),
              month: date.getMonth() - 1
            }
          } as PreviousCurrencyData;
        })
      ))
    );
  }

  getCurrentDataFromStorage(): CurrencyData {
    return JSON.parse(localStorage.getItem('currencyData')) || null;
  }

  setCurrentDataToStorage(data: CurrencyData) {
    localStorage.setItem('currencyData', JSON.stringify(data));
  }

  private async parseXML(xml: string): Promise<CbrCurrencyRecord[]> {
    const parser = new xml2js.Parser({
      mergeAttrs: true,
      trim: true,
      explicitArray: false
    });
    const result = await parser.parseStringPromise(xml);
    let records = Array.isArray(result.ValCurs.Record) ? result.ValCurs.Record : [result.ValCurs.Record];

    records = records.map(r => ({
      id: r.Id,
      date: r.Date,
      value: +Helpers.getNumber(r.Value).toFixed(2)
    })) as CbrCurrencyRecord[];

    return records;
  }
}
