module.exports = (connection) => {
    const { DataTypes, Model } = require("sequelize");
    const bcrypt = require("bcryptjs");
    class User extends Model {
        isPasswordValid(password) {
            return bcrypt.compare(password, this.password);
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            login: {
                type: DataTypes.STRING(64),
                unique: true,
                allowNull: false,
                validate: {
                    len: [1, 64],
                },
            },
            name: {
                type: DataTypes.STRING(64),
                allowNull: false,
                validate: {
                    len: [1, 64],
                },
            },
            surname: {
                type: DataTypes.STRING(64),
                allowNull: false,
                validate: {
                    len: [1, 64],
                },
            },
            Birthdate: {
                type: DataTypes.DATE,
                allowNull: true,
                validate: {
                    isDate: true,
                },
            },
            email: {
                type: DataTypes.STRING(320),
                unique: true,
                allowNull: false,
                validate: {
                    isEmail: true,
                    len: [1, 320],
                    isNotNull: function (value) {
                        if (value === null) {
                            throw new Error("Email cannot be null");
                        }
                    },
                },
            },
            password: {
                type: DataTypes.STRING(256),
                allowNull: false,
                validate: {
                    len: [8, 256]
                    //is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
                },
            },
            isValid: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            token: {
                type: DataTypes.STRING(256),
                allowNull: true,
            },
        },
        {
            sequelize: connection,
            tableName: "users",
        }
    );

    function updatePassword(user) {
        return bcrypt.genSalt(10).then((salt) =>
            bcrypt.hash(user.password, salt).then((hash) => {
                user.password = hash;
            })
        );
    }

    User.addHook("beforeCreate", async (user) => {
        try {
            const roles = await Role.findAll({ limit: 2 });
            if (roles.length >= 2) {
                user.id_role = roles[1].id;
            } else {
                throw new Error("Not enough roles found in the 'roles' table.");
            }
        } catch (error) {
            console.error("Error setting default role:", error);
        }
        return updatePassword(user);
    });

    User.addHook("beforeUpdate", async (user, options) => {
        if (options.fields.includes("password")) {
            return updatePassword(user);
        }
    });

    return User;

};