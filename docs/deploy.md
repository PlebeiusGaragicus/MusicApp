TODO: pre setup


```sh
# install SSH keys... then make sure the password is not required to login (how?)

```


# PART 1
```sh
# update the system
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install -y build-essential curl

# install nodejs
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# install a web server
sudo apt-get install -y nginx

# configure nginx
sudo nano /etc/nginx/sites-available/<your_domain>
```

```
# Paste the following configuration into the file, replacing <your_domain> and <path_to_your_app> with appropriate values:

server {
    listen 80;
    server_name <your_domain>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location ~ ^/(assets|images|javascript|stylesheets|swfs|system)/ {
        root <path_to_your_app>/public;
        expires max;
        break;
    }
}
```


# PART 2
```sh
# create symbolic link to enable the configuration:
sudo ln -s /etc/nginx/sites-available/<your_domain> /etc/nginx/sites-enabled/

# test the configuration
sudo nginx -t

# if no errors, restart nginx
sudo service nginx restart


# transfer your app to the server
scp -r <path_to_your_local_app> <your_username>@<your_ip>:/home/<your_username>/<your_app_name>
# ---OR---
git clone <your_repository_url> /home/<your_username>/<your_app_name>
rm -rf /home/<your_username>/<your_app_name>/.git
# ---OR---
# TODO - I need to double check what --depth 1 does
git clone --depth 1 <your_repository_url> /home/<your_username>/<your_app_name>


# install application dependencies
cd /home/<your_username>/<your_app_name>
npm install

# install pm2
sudo npm install pm2 -g

# start the app
pm2 start npm --name "<your_app_name>" -- start

# save the app list
pm2 save

# configure pm2 to start on boot
pm2 startup systemd

# TODO
# copy the output of the previous command and run it
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u <your_username> --hp /home/<your_username>

```


# secure the application with SSL
```sh
# TODO
sudo apt-get install -y certbot python3-certbot-nginx

sudo certbot --nginx -d <your_domain>
```


# monitor
```sh
top
htop
vmstat
```