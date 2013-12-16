set :application, 'Trending Food'
set :repo_url, 'https://github.com/ICANS/trending-food.git'
set :branch, 'master'
# ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }

set :scm, :git
set :deploy_via, :remote_cache
set :npm_cmd, "npm"

# set :format, :pretty
set :log_level, :debug
# set :pty, true

set :linked_files, %w{config.js app/web/config.js}
# set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# set :default_env, { path: "/opt/ruby/bin:$PATH" }
# set :keep_releases, 5

after 'deploy:updated', "npm:install"
