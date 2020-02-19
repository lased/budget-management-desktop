import { Model, DataTypes, Sequelize } from 'sequelize';

export class User extends Model {
    public id!: number;
    public name!: string;
    public main!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export function init(sequelize: Sequelize) {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(64),
            allowNull: false,
            unique: true
        },
        main: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        }
    }, {
            tableName: 'users',
            sequelize
        });
    User.sync().then(async () => {
        const user = await User.findOne({ where: { main: true } });

        if (!user) {
            await User.create({ main: true, name: 'Глава семьи' });
        }
    });
}
