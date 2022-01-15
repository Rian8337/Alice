module.exports = {
  apps : [{
    name: "Bot",
    script: "./dist/main.js",
    args: "--trace-warnings",
    instances: 1,
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
};
