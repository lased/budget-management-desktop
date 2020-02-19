import { Model, DataTypes, Sequelize } from 'sequelize';

import { User } from './user';
import { Category } from './category';
import { RecordType } from '../interfaces';
import { Product } from './product';

export class Record extends Model {
    public id!: number;
    public type!: RecordType;
    public categoryId!: number;
    public category: Category;
    public subcategoryId: number;
    public subcategory: Category;
    public userId!: number;
    public user: User;
    public date!: Date;
    public amount!: number;
    public note: string;
    public products: Product[];

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export function init(sequelize: Sequelize) {
    Record.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        type: {
            type: DataTypes.TINYINT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        note: {
            type: new DataTypes.STRING(255),
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        tableName: 'records',
        sequelize
    });
    Record.hasMany(Product, { foreignKey: 'recordId', sourceKey: 'id', onDelete: 'CASCADE', as: 'products' });
    Record.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'user' });
    Record.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'CASCADE', as: 'category' });
    Record.belongsTo(Category, { foreignKey: 'subcategoryId', onDelete: 'CASCADE', as: 'subcategory' });
    Record.sync();
}
