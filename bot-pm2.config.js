module.exports = {
    apps: [{
      script: "index.js",
      watch: ["commands/*.js", "index.js"],
      // Delay between restart
      watch_delay: 0,
      ignore_watch : ["node_modules"],
    }]
  }