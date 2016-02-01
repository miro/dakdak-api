dakdak-backend
==============

Backend for "Dakdak image gallery". See also [Dakdak Management App](https://github.com/miro/dakdak-mgmt). Aimed to be hosted on Heroku.


## Requirements

* ImageMagick (you'll get weird errors if you haven't got this one installed)
* PostgreSQL database
* Google Cloud Storage account


## Create development PostgreSQL database
	CREATE ROLE dakdak WITH LOGIN PASSWORD 'dakdak';
	CREATE DATABASE dakdak WITH OWNER dakdak;


# Deploying

<TODO: how-to-deploy-this on Heroku> 

Saving for further use; how to setup multi-line environment variable in Heroku (for eg private key):

* Generate you Service Account key from Google Dashboard
* Open the file, copy the attribute `private_key` from it
* Type `echo` to console, and paste the `private_key` after it. You will get the key outputted with proper newlines.
* At least on OSX El Capitan + iTerm2 there was some bug related to setting the key via `heroku set:config`. Copying the whole content of the `echo` output will get the key somehow corrupted on Heroku when saved via `heroku config:set`. My advice is to start the updating of the env var with command `heroku config:set DAKDAK_GCS_PRIVATE_KEY="`, then copy the first half of the key, and then the second half, and then ending the command with `" --app <your-app-name>`. (Please note the double quotes). This should work!


=======

## Acknowledgements
This project is a grateful recipient of the [Futurice Open Source sponsorship program](http://futurice.com/blog/sponsoring-free-time-open-source-activities). ♥
