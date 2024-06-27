// This is a PM2 config file for production deployment. It dictates how the application runs when deployed to an EC2
// instance. For more information see: https://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps: [
    {
      name: 'reservation-service',
      cwd: '/opt/service/',
      script: 'npm run start:prod',
      watch: [''],
      ignore_watch: ['./node_modules'],
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: '/dev/stdout',
    },
  ],
};
