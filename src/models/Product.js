import bcrypt from 'bcryptjs';

export default (sequelize, DataTypes) => {
    const Product = sequelize.define(
        'product', {
            product_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            categoryid: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'category',
                    key: 'id',
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            userid: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'user',
                    key: 'id',
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            imageid: {
                type: DataTypes.STRING,
            },
            price: {
                type: DataTypes.INTEGER,
            },
        }, {
            freezeTableName: true,
        }
    );



    return Product;
};