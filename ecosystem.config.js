module.exports = {
  apps : [{
    name: "Bot",
    script: "mybot.js",
    instances: 1,
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
};