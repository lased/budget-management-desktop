import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { QRData } from '../interfaces';

interface FnsAccount {
  phone: string;
  email?: string;
  name?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FnsService {
  private URL_API: string;

  constructor(
    private http: HttpClient,
    private message: MessageService
  ) {
    this.URL_API = 'https://proverkacheka.nalog.ru:9999/v1';
  }

  isValid() {
    const phone = localStorage.getItem('fnsPhone');
    const password = localStorage.getItem('fnsPassword');

    return phone && password;
  }

  parseQrCode(data: string): QRData {
    const qrData: QRData = {};

    data.split('&').forEach(row => {
      const [name, value] = row.split('=');

      qrData[name] = value;
    });

    qrData.s = +qrData.s;
    qrData.n = +qrData.n;

    let [date, time] = qrData.t.split('T');

    time = time.replace(/([0-9]{2})/g, '$1:').slice(0, -1);
    date = date.replace(/([0-9]{4})([0-9]{2})/, '$1-$2-');
    qrData.t = [date, time].join('T');
    qrData.s *= 100;

    return qrData;
  }

  login(options: FnsAccount): Observable<HttpResponse<any>> {
    const headers =
      new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${btoa(options.phone + ':' + options.password)}`);

    return this.http.get(`${this.URL_API}/mobile/users/login`, {
      headers,
      observe: 'response'
    }).pipe(
      tap(_ => {
        localStorage.setItem('fnsPhone', options.phone);
        localStorage.setItem('fnsPassword', options.password);
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.message.add({
            life: 10000,
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Неверный логин/пароль или пользователь не существует'
          });
        }

        return throwError(err);
      })
    );
  }

  restore(options: FnsAccount): Observable<HttpResponse<any>> {
    const headers =
      new HttpHeaders()
        .set('Content-Type', 'application/json');

    return this.http.post(`${this.URL_API}/mobile/users/restore`, {
      phone: options.phone
    }, {
      headers,
      observe: 'response'
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.message.add({
            life: 10000,
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Пользователя не существует'
          });
        }

        return throwError(err);
      })
    );
  }

  register(options: FnsAccount): Observable<HttpResponse<any>> {
    const headers =
      new HttpHeaders()
        .set('Content-Type', 'application/json');

    return this.http.post(`${this.URL_API}/mobile/users/signup`, {
      phone: options.phone,
      name: options.name,
      email: options.email
    }, {
      headers,
      observe: 'response'
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.message.add({
            life: 10000,
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Данный пользователь уже существует'
          });
        }

        return throwError(err);
      })
    );
  }

  getData(options: QRData): Observable<HttpResponse<any>> {
    let params = new HttpParams();

    params = params
      .set('fiscalSign', `${options.fp}`)
      .set('sendToEmail', 'no');

    return this.checkExists(options).pipe(
      switchMap(_ => this
        .http
        .get(`${this.URL_API}/inns/*/kkts/*/fss/${options.fn}/tickets/${options.i}`, {
          headers: this.getHeaders(),
          params,
          observe: 'response'
        }).pipe(
          tap(res => {
            if (res.status === 202) {
              this.message.add({
                life: 10000,
                severity: 'info',
                summary: 'Обработка',
                detail: 'Чек найден, но не обработан'
              });
            }
          }),
          catchError((err: HttpErrorResponse) => {
            if (err.status === 406) {
              this.message.add({
                life: 10000,
                severity: 'error',
                summary: 'Ошибка',
                detail: 'Чек не найден'
              });
            }

            return throwError(err);
          })
        )
      )
    );
  }

  checkExists(options: QRData): Observable<HttpResponse<any>> {
    let params = new HttpParams();

    params = params
      .set('fiscalSign', `${options.fp}`)
      .set('date', `${options.t}`)
      .set('sum', `${options.s}`);

    return this.http.get(`${this.URL_API}/ofds/*/inns/*/fss/${options.fn}/operations/${options.n}/tickets/${options.i}`, {
      headers: this.getHeaders(),
      params,
      observe: 'response'
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 406) {
          this.message.add({
            life: 10000,
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Чек не найден'
          });
        }

        return throwError(err);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const phone = localStorage.getItem('fnsPhone');
    const password = localStorage.getItem('fnsPassword');

    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${btoa(phone + ':' + password)}`)
      .set('Device-Id', '')
      .set('Device-Os', '');
  }
}
