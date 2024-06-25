module.exports = {
    development: {
        username: "root",
        password: "password",
        database: "app",
        port: 5439,
        dialect: "postgres"
    },
    test: {
        username: "root",
        password: "password",
        database: "app_test",
        port: 5432,
        dialect: "postgres"
    },
    production: {
        username: "root",
        password: "password",
        database: "app",
        port: 5432,
        dialect: "postgres"
    }
};
