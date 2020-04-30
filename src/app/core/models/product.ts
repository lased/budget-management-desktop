import { Model, DataTypes, Sequelize } from 'sequelize';

import { Record } from './record';

export class Product extends Model {
    public id!: number;
    public recordId!: number | Record;
    public name!: string;
    public price!: number;
    public quantity!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export function init(sequelize: Sequelize) {
    Product.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        quantity: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        recordId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'products',
        sequelize
    });
    Product.sync();
}
