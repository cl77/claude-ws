module.exports = {
  apps: [
    {
      name: 'claudews',
      script: '/bin/bash',
      args: '-lc \'if [ ! -f .next/BUILD_ID ]; then echo "[PM2] Missing .next build, running pnpm build..."; pnpm build; fi; pnpm start\'',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
