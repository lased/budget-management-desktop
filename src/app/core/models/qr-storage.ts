import { Model, DataTypes, Sequelize } from 'sequelize';

import { Record } from './record';

export class QrStorage extends Model {
    public id!: number;
    public recordId!: number | Record;
    public data!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export function init(sequelize: Sequelize) {
    QrStorage.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        data: {
            type: new DataTypes.STRING(255),
            allowNull: false
        },
        recordId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'qr_storage',
        sequelize
    });
    QrStorage.belongsTo(Record, { foreignKey: 'recordId', onDelete: 'CASCADE' });
    QrStorage.sync();
}
