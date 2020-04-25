import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

export interface DateFilter {
    min?: Date;
    max?: Date;
}

@Injectable()
export class AnalyzeService {
    private period = new ReplaySubject<DateFilter>();

    getPeriod() {
        return this.period;
    }

    setPeriod(period: Date[]) {
        const [min, max] = period;
        const dateFilter: DateFilter = {
            min: new Date(),
            max: new Date()
        };


        if (min) {
            dateFilter.min = min;
        }
        if (max) {
            dateFilter.max = max;
        }

        dateFilter.min.setHours(0, 0);
        dateFilter.max.setHours(23, 59);
        this.period.next(dateFilter);

        return dateFilter;
    }
}
