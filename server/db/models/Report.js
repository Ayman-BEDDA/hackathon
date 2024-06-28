module.exports = (connection) => {
    const { DataTypes, Model } = require("sequelize");

    class Report extends Model {}

    Report.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            subject: {
                type: DataTypes.STRING(256),
                allowNull: false,
                validate: {
                    len: [1, 256],
                },
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            roomId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'rooms',
                    key: 'id'
                }
            }
        },
        {
            sequelize: connection,
            tableName: "reports",
        }
    );

    return Report;
};
