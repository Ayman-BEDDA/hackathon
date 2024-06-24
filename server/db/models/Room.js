module.exports = (connection) => {
    const { DataTypes, Model } = require("sequelize");

    class Room extends Model {}

    Room.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            }
        },
        {
            sequelize: connection,
            tableName: "rooms",
        }
    );

    return Room;
};
