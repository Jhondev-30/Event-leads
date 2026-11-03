module.exports = {
  apps: [
    {
      name: 'speakup-calendar',
      script: './dist/server/entry.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4321,
        HOST: '0.0.0.0'
      }
    }
  ]
};
