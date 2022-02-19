export default (sequelize, DataTypes) => {
    const Category = sequelize.define(
        'category', {
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            freezeTableName: true,
        }
    );
    return Category;
};