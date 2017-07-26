# AppDynamics Grafana Datasource

Steps
1. Install and bring grafana up (tested with grafana 4.4)
2. Clone this project to the grafana plugins folder (default /var/lib/grafana/plugins)
3. Configure a Datasource, the access should be "proxy" because of cross scripting.
![config](http://i.imgur.com/NsSTbDn.png)

## For the devs out there:

After following the above steps:
1. npm install
2. gulp
3. Code away!