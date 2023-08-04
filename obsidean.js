const json = require('./techstars.json');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const neo4j = require('neo4j-driver');
var async = require('async')
var template = require('lodash.template');

const fs = require('fs');

var session_tpl = _.template(`
### Session
<%=data[0].session%>

### Accel
[[<%=data[0].accelerator%>]]

### Companies:
<%_.forEach(data, function (u,i) {%>- [[<%=u.name%>]]
<%})%>

`)

var acc_tpl = _.template(`
### Accelerator
<%=accelerator%>
 
### Sessions: 
<%_.forEach(sessions, function (u,i) {%>- [[<%=u%>]]
<%})%>

`)

var founder_tpl = _.template(`
### Founder
<%=data[0]%>
 
### Company: 
[[<%=company.name%>]]

`)

var tpl = _.template(`

![<%=item.name%>|50x50](<%=item.logo_url%>)

#### <%=item.name%>
<%=item.description%>

### Stage: 
<%=item.stage%> - <%=item.type%> 

### Current Status: 
<%=item.status%>

### Where:
<%=item.city%>, <%=item.state%>, <%=item.country%>

### Site:
<%=item.website%>

<%=item.demo_day_pitch_video_url%>

<%=item.crunchbase_profile%>

### Current Status: 
<%=item.status%>

### Cohort/Sessions: 
<%=item.accelerator%>, in <%=item.session%>

### Founders: 
<%_.forEach(item.founder_profile_arrays, function (u,i) {%>
![<%=u[0]%>|50x50](<%=u[2]%>) <%=u[0]%> (<%=u[1] || ''%>) [LinkedIn](https://<%=u[3]%>) [[<%=u[0] || ''%>]]
<%})%>

`
);

var jsonData = json;

var q = async.queue(function(task, callback) {

	fs.writeFile(task.filename, task.html, (err) => {
		if (err) {
			console.log('Failed', task.filename, err.message);
		}
		callback();
	});

}, 1);

// assign a callback
q.drain(function() {
    console.log('all items have been processed');
});

async function main() {

	let totalFounders = 0;

	_.forEach(jsonData, async (item, i) => {
		const html = tpl({ 'item': item });
		const filename = `./Techstars/Companies/${item.name}.md`
		q.push({ filename, html });

		_.forEach(item.founder_profile_arrays, async (founder, x) => {
			try {
				const html = founder_tpl({ data: founder, company: item });
				const name = founder[0];
				if (name) {
					totalFounders++;
					const filename = `./Techstars/Founders/${founder[0]}.md`;
					q.push({ filename, html });
				}
			} catch(err) {
				console.log(item, founder)
			}
		})
	})

	console.log('totalFounders', totalFounders);

	var sessions = _.chain(jsonData).groupBy('session').value();
	_.forEach(sessions, async (data, key) => { 
		let filename = `./Techstars/Sessions/${key}.md`
		let html = session_tpl({ data: data })
		q.push({ filename, html });
	})

	var accelerators = _.chain(jsonData).groupBy('accelerator').value();
	_.forEach(accelerators, async (data, key) => { 
		let filename = `./Techstars/Accelerators/${key}.md`
		let sessions = _.chain(data).map('session').uniq().value();
		let html = acc_tpl({ sessions: sessions, accelerator: key })
		
		q.push({ filename, html });
	})

}

main();
