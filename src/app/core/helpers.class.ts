import { formatCurrency, getCurrencySymbol, formatDate, formatNumber } from '@angular/common';

export class Helpers {
    public static formatCurrency(value: number, currencyCode: string = 'RUB', locale: string = 'ru', digitsInfo: string = '1.0-2') {
        return formatCurrency(value, locale, getCurrencySymbol(currencyCode, 'narrow'), currencyCode, digitsInfo);
    }

    public static formatDate(value: string | number | Date, format: string = 'dd.MM.yyyy H:mm', locale: string = 'ru') {
        return formatDate(value, format, locale);
    }

    public static formatNumber(value: number, locale: string = 'ru', digitsInfo: string = '1.0-2') {
        return formatNumber(value, locale, digitsInfo);
    }

    public static getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}
