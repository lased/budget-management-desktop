import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { Op, Sequelize } from 'sequelize';
import { FilterMetadata } from 'primeng/api';

import { RecordType } from '@core/interfaces';
import { Record } from '@core/models/record';
import { Category } from '@core/models/category';
import { Product } from '@core/models/product';
import { Literal } from 'sequelize/types/lib/utils';

export interface DateFilter {
    min?: Date;
    max?: Date;
}

@Injectable()
export class AnalyzeService {
    private period = new ReplaySubject<DateFilter>();
    private filters = new Subject<{ [s: string]: FilterMetadata }>();

    getFilters() {
        return this.filters;
    }

    setFilters(filters: { [s: string]: FilterMetadata }) {
        this.filters.next(filters);
    }

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

    getSumGroupCategory(type: RecordType, period: DateFilter, productMode: boolean, child = false): Promise<Record[]> {
        const dateQuery = {
            [Op.gte]: period.min,
            [Op.lte]: period.max
        };

        return Record.findAll({
            attributes: [
                [
                    Sequelize.literal(`SUM(${
                        productMode
                            ? 'products.price * products.quantity'
                            : 'amount'
                        })`), 'amount'
                ]
            ],
            where: {
                type,
                date: dateQuery,
                ...(child ? { subcategoryId: { [Op.not]: null } } : {})
            },
            include: [
                ...(productMode ? [{ model: Product, as: 'products', required: true }] : []),
                { model: Category, as: child ? 'subcategory' : 'category' }
            ],
            group: [child ? 'subcategoryId' : 'categoryId']
        });
    }
}
