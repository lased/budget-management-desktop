import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { Op, Sequelize, FindOptions } from 'sequelize';
import { FilterMetadata } from 'primeng/api';

import { RecordType } from '@core/interfaces';
import { Record } from '@core/models/record';
import { Category } from '@core/models/category';
import { Product } from '@core/models/product';

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

    getMonthlyExpenses(): Promise<Record[]> {
        const dateFn = Sequelize.fn('datetime', Sequelize.col('date'), 'start of month');

        return Record.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount'],
                [dateFn, 'date']
            ],
            where: { type: RecordType.expense },
            group: [dateFn],
            order: ['date']
        });
    }

    async getPlanningData(): Promise<Record[]> {
        const startMonth = Sequelize.fn('datetime', 'now', 'start of month');
        const endMonth = Sequelize.fn('datetime', 'now', 'start of month', '+1 month');
        const catQueryOptions = (ids, prefix = '') => ({
            attributes: {
                include: [
                    [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount']
                ],
                exclude: [!prefix ? 'subcategoryId' : '']
            },
            where: {
                date: {
                    [Op.gte]: startMonth,
                    [Op.lte]: endMonth
                },
                [prefix + 'categoryId']: { [Op.in]: ids },
            },
            group: [prefix + 'categoryId']
        } as FindOptions);
        const categories: Category[] = await Category.findAll({ where: { plan: { [Op.not]: null } } });
        const catsId = categories.map(c => c.id);
        let emptyFactValues: Category[] = [];
        let records: Record[] = [];

        records.push(
            ...await Record.findAll(catQueryOptions(catsId)),
            ...await Record.findAll(catQueryOptions(catsId, 'sub'))
        );
        emptyFactValues = categories.filter(c => !records.some(r => r.subcategoryId === c.id || r.categoryId === c.id));
        records = records.map(r => {
            for (let index = 0; index < categories.length; index++) {
                const category = categories[index];

                if (category.id === r.categoryId) {
                    r.category = category;
                }
                if (category.id === r.subcategoryId) {
                    r.subcategory = category;
                }
            }

            return r;
        });

        return [
            ...records,
            ...emptyFactValues.map(c => {
                const rec = new Record({
                    amount: 0,
                    categoryId: c.parentId ? c.parentId : c.id,
                    subcategoryId: c.parentId ? c.parentId : null
                });

                if (c.parentId) {
                    rec.category = categories.find(cat => c.parentId === cat.id);
                    rec.subcategory = c;
                } else {
                    rec.category = c;
                }

                return rec;
            })
        ];
    }
}
