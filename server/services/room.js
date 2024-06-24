const { Room } = require("../db");
const Sequelize = require("sequelize");
const ValidationError = require("../errors/ValidationError");

module.exports = function RoomService() {
    return {
        findAll: async function (filters, options) {
            let dbOptions = {
                where: filters,
            };
            options.order = {createdAt: "DESC"}
            if (options.order) {
                // => [["name", "ASC"], ["dob", "DESC"]]
                dbOptions.order = Object.entries(options.order);
            }
            if (options.limit) {
                dbOptions.limit = options.limit;
                dbOptions.offset = options.offset;
            }
            return Room.findAll(dbOptions);
        },
        findOne: async function (filters) {
            return Room.findOne({
                where: filters,
            });
        },
        create: async function (data) {
            let createdRoom;

            try {
                createdRoom = await Room.create(data);
                return createdRoom;
            } catch (e) {
                if (createdRoom) {
                    await createdRoom.destroy();
                }

                if (e instanceof Sequelize.ValidationError) {
                    throw ValidationError.fromSequelizeValidationError(e);
                }

                throw e;
            }
        },
        replace: async function (filters, newData) {
            try {
                const nbDeleted = await this.delete(filters);
                const room = await this.create(newData);
                return [[room, nbDeleted === 0]];
            } catch (e) {
                if (e instanceof Sequelize.ValidationError) {
                    throw ValidationError.fromSequelizeValidationError(e);
                }
                throw e;
            }
        },
        update: async (filters, newData) => {
            try {
                const [nbUpdated, rooms] = await Room.update(newData, {
                    where: filters,
                    returning: true,
                    individualHooks: true,
                });

                return rooms;
            } catch (e) {
                if (e instanceof Sequelize.ValidationError) {
                    throw ValidationError.fromSequelizeValidationError(e);
                }
                throw e;
            }
        },
        delete: async (filters) => {
            return Room.destroy({ where: filters });
        },
    };
};
