# AppDynamics Grafana Datasource

AppDynamics datasource for grafana.

![example_dashboard](http://imgur.com/MIBYyCY.png)

## Grafana CLI

``grafana-cli plugins install dlopes7-appdynamics-datasource``

## With docker

With the command below, grafana will start on localhost:3000 (192.168.99.100:3000 if on windows)

``docker run -d -p 3000:3000 --name grafana -e "GF_INSTALL_PLUGINS=dlopes7-appdynamics-datasource" grafana/grafana``

## Note on the Datasource config

Use proxy access (to avoid CORS and users looking up your password) and basic authentication.

![config](http://imgur.com/ayL8kFO.png)

## For the devs out there:

1. ``git clone https://github.com/dlopes7/appdynamics-grafana-datasource``
2. ``docker run -d -p 3000:3000 --name grafana -v `pwd`:/var/lib/grafana/plugins/appdynamics-grafana-datasource/ grafana/grafana``


## Templating

The supported template queries for now are:

1. `Applications` (All Applications)
2. `AppName.BusinessTransactions` (All BTs for the Application Name)
3. `AppName.Tiers` (All Tiers for the Application Name)
4. `AppName.Nodes` (All Nodes for the Application Name)
5. `AppName.TierName.BusinessTransactions` (All BTs for a specific Tier)
6. `AppName.TierName.Nodes` (All Nodes for a specific Tier)

![templating](https://imgur.com/U0OGYkO.png)