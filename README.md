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



=======

## Acknowledgements
This project is a grateful recipient of the [Futurice Open Source sponsorship program](http://futurice.com/blog/sponsoring-free-time-open-source-activities). ♥
