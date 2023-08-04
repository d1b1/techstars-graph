const json = require('./techstars.json');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const neo4j = require('neo4j-driver');
var async = require('async')

const driver = require('../clients/neo4j.js')

var jsonData = json;
let count = 0;

var q = async.queue(function(task, callback) {
    count++;
	const session = driver.session({ database: 'neo4j' });
	session.executeWrite(tx => tx.run(task.cypher, {})).then(callback)
}, 1);

// assign a callback
q.drain(function() {
    console.log('all items have been processed');
});

async function main() {

	const promises = [];
	_.forEach(jsonData, async (item, i) => {

		item.uuid = item.master_company_id;

		const founder_profile_arrays = item.founder_profile_arrays;
		delete item.founder_profile_arrays
		delete item.demo_day_pitch_video_url;
		item = _.omitBy(item, v => v === null);

		const unquoted = JSON.stringify(item).replace(/"([^"]+)":/g, '$1:');
		const cypher = `MERGE (c:Company ${unquoted}) `;

		// Setup the accelerator and its relationship
		// to the company. As well as linking the accelerator 
		// to the Master Label.
		const cypherAcc = `
	   MERGE (a:Company { name: '${item.accelerator.trim()}' }) 
	   MERGE (a)-[:PART_OF]->(c)
	   MERGE (g:Company { uuid: '06e77c58-c2d7-4671-86a8-3113d6db41a9' })
	   MERGE (a)-[:PART_OF]->(g)
	`;

		const pList = [];
		const rList = []
		_.forEach(founder_profile_arrays || [], (founder, i) => {

			const d = _.omitBy({
				uuid: uuidv4(),
				name: founder[0],
				title: founder[1],
				logoUrl: founder[2],
				linkedIn: founder[3],
				role: founder[4],
				source: 'TSBatch'
			}, v => v === null);

			const unquoted_person = JSON.stringify(d).replace(/"([^"]+)":/g, '$1:');
			pList.push(`MERGE (p${i}:Person ${unquoted_person} )`);

			const r = _.omitBy({
				title: founder[1],
				role: founder[4],
				source: 'TSBatch'
			}, v => v === null);

			const unquoted_rel = JSON.stringify(r).replace(/"([^"]+)":/g, '$1:');

			rList.push(`MERGE (p${i})-[r${i}:FOUNDED ${unquoted_rel} ]->(c) `);
		});

		const final = cypher
			+ '\n'
			+ cypherAcc + '\n'
			+ pList.join('\n')
			+ ' ' + rList.join('\n')
			+ 'RETURN c;';

		// add some items to the queue
        q.push({ cypher: final }, function(err) {
          console.log('finished processing foo');
        });

	});

}

main();
