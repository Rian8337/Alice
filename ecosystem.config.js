module.exports = {
    apps: [
        {
            name: "Bot",
            script: "./src/main.ts",
            args: "--trace-warnings -r ts-node/register",
            instances: 1,
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
