import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { QRData, FnsAccount } from '../interfaces';
import { FnsRequestError } from '@shared/components/fns/fns.interface';

@Injectable({
  providedIn: 'root',
})
export class FnsService {
  private URL_API = 'https://proverkacheka.nalog.ru:9999/v1';
  private user: FnsAccount;

  constructor(
    private http: HttpClient,
    private message: MessageService
  ) {
    this.init();
  }

  init() {
    this.user = this.getUserData();
  }

  getUserData() {
    return {
      phone: localStorage.getItem('fnsPhone'),
      password: localStorage.getItem('fnsPassword')
    };
  }

  auth(options: FnsAccount) {
    localStorage.setItem('fnsPhone', options.phone);
    localStorage.setItem('fnsPassword', options.password);
    this.user = { ...this.user, ...options };
  }

  isValid() {
    return Boolean(this.user.phone) && Boolean(this.user.password);
  }

  login(options: FnsAccount): Observable<HttpResponse<any>> {
    const headers = this
      .getHeaders()
      .set('Authorization', `Basic ${btoa(options.phone + ':' + options.password)}`);

    return this.http.get(`${this.URL_API}/mobile/users/login`, {
      headers,
      observe: 'response'
    }).pipe(
      tap(_ => this.auth(options)),
      catchError((err: HttpErrorResponse) => {
        const newError = new FnsRequestError(err.status, 'Неизвестная ошибка');

        if (err.status === 403) {
          newError.message = 'Неверный логин/пароль или пользователь не существует';
        }

        return throwError(newError);
      })
    );
  }

  restore(options: FnsAccount): Observable<HttpResponse<any>> {
    const headers = this.getHeaders();

    return this.http.post(`${this.URL_API}/mobile/users/restore`, {
      phone: options.phone
    }, {
      headers,
      observe: 'response'
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        const newError = new FnsRequestError(err.status, 'Неизвестная ошибка');

        switch (err.status) {
          case 409:
            newError.message = 'Пользователь уже существует';
            break;
          case 400:
            newError.message = 'Некорректный email';
            break;
        }

        return throwError(newError);
      })
    );
  }

  register(options: FnsAccount): Observable<HttpResponse<any>> {
    const headers = this.getHeaders();

    return this.http.post(`${this.URL_API}/mobile/users/signup`, {
      phone: options.phone,
      name: options.name,
      email: options.email
    }, {
      headers,
      observe: 'response'
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        const newError = new FnsRequestError(err.status, 'Неизвестная ошибка');

        if (err.status === 404) {
          newError.message = 'Номер телефона не найден';
        }

        return throwError(newError);
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
          headers: this
            .getHeaders()
            .set('Authorization', `Basic ${btoa(this.user.phone + ':' + this.user.password)}`),
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
        const newError = new FnsRequestError(err.status, 'Неизвестная ошибка');

        if (err.status === 406) {
          newError.message = 'Чек не найден';
        }

        return throwError(newError);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Device-Id', '')
      .set('Device-Os', '');
  }
}
