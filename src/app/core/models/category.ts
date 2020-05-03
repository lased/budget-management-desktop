import { Model, DataTypes, Sequelize } from 'sequelize';

import { RecordType } from '../interfaces';

interface DefaultCategory {
    name: string;
    sub?: DefaultCategory[];
}

export class Category extends Model {
    public id!: number;
    public name!: string;
    public type!: RecordType;
    public parentId: number;
    public plan: number;
    public parent: Category;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export function init(sequelize: Sequelize) {
    Category.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(64),
            allowNull: false
        },
        type: {
            type: DataTypes.TINYINT,
            allowNull: false
        },
        plan: {
            type: DataTypes.DOUBLE,
            allowNull: true
        }
    }, {
            tableName: 'categories',
            sequelize
        });
    Category.hasMany(Category, { foreignKey: 'parentId', sourceKey: 'id', onDelete: 'CASCADE' });
    Category.sync().then(async () => {
        const categoryCount = await Category.count({
            where: {
                parentId: null
            }
        });
        const categories: { [key: number]: DefaultCategory[] } = {};

        categories[RecordType.income] = [
            { name: 'Пенсия' },
            { name: 'Стипендия' },
            { name: 'Дивиденды' },
            {
                name: 'Зарплата',
                sub: [
                    { name: 'Аванс' },
                    { name: 'Оклад' },
                    { name: 'Премия' }
                ]
            },
        ];
        categories[RecordType.expense] = [
            { name: 'Развлечения' },
            { name: 'Продукты питания' },
            {
                name: 'Комунальные услуги',
                sub: [
                    { name: 'Электроэнергия' },
                    { name: 'Квартплата' },
                    { name: 'Газ' }
                ]
            },
            {
                name: 'Транспорт',
                sub: [
                    { name: 'Автобус' },
                    { name: 'Маршрутка' },
                    { name: 'Электричка' },
                    { name: 'Такси' }
                ]
            }
        ];

        if (!categoryCount) {
            for (const key in categories) {
                if (categories.hasOwnProperty(key)) {
                    const ctgs = categories[key];

                    saveCategories(+key, ctgs);
                }
            }
        }
    });
}

function saveCategories(type: number, ctgs: DefaultCategory[], parentId: number = null) {
    ctgs.forEach(async ctg => {
        const created: Category = await Category.create({
            type,
            parentId,
            name: ctg.name
        });

        if (ctg.sub && ctg.sub.length) {
            saveCategories(type, ctg.sub, created.id);
        }
    });
}
