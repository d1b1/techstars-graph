#### Techstars Graph Solutions

This repo contains raw JSON data for Techstars. As well as code for creating an
Obsidean project (locally), and code to inject the data into a neo4j database. This data
is not restricted, as it was available (hidden a little) on the Techstars
site.

### Setup for Neo4j
Neo4j is a graph db. This repo contains a script that will 
create a connection to either cloud neo4j db or local. And it will create 
labels for companies, programs and people.

``` node neo4j.js ```

The resulting social graph is predictablity a larger sphere. So you will
need to read up on Neo4j's query language3 cypher.

### Setup for Obsidean
Background, Obsidean is a desktop note taking software (has a cloud offering). Its 
free and includes some social graph display features. This code script will reformat
the data into files that work with Obsidean and can display relationships.

``` node obsidean.js ```

(Note: Large Obsidean projects get slow.)

### Algolia Search Index
Finally there is a search index option for pushing the data to Algolia. This 
option is purely for search, and OTB Algolia does not support graph and relationships
visualizations.

### Next Steps
There is some stub code in this repo for OpenAI integration, but its not functional 
or ready for prime time.