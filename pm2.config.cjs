module.exports = {
  apps: [
    {
      name: 'bars',
      script: './stream_bars_polygon.ts',
      interpreter: 'node',
      watch: false,
      kill_timeout: 3000,
      instances: 1,
      max_restarts: 1000,
      restart_delay: 1000
    },
    {
      name: 'signals',
      script: './signals.ts',
      args: '-s 2-tvix-rsi',
      interpreter: 'node',
      watch: false,
      kill_timeout: 3000,
      instances: 1,
      max_restarts: 10,
      restart_delay: 1000
    }
  ]
}
