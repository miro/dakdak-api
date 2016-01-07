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

* Save your private key / multi-file var into a file, for eg `temp.txt`
* (Make sure NOT to save that file into git)
* Execute this
* `heroku config:set DAKDAK_GCS_PRIVATE_KEY="$(cat temp.txt)"`
* Profit!


=======

## Acknowledgements
This project is a grateful recipient of the [Futurice Open Source sponsorship program](http://futurice.com/blog/sponsoring-free-time-open-source-activities). ♥
