module.exports = {
  apps : [{
    name: "Bot",
    script: "./dist/main.js",
    args: "--trace-warnings --optimize_for_size",
    instances: 1,
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
};