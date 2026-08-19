package com.dhanraj.graph.app.repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.neo4j.driver.Driver;
import org.neo4j.driver.exceptions.Neo4jException;
import org.springframework.stereotype.Repository;

import com.dhanraj.graph.app.exception.DeveloperNotFoundException;
import com.dhanraj.graph.app.exception.GraphDatabaseException;

@Repository
public class GraphRepository {

	private final Driver driver;

	public GraphRepository(Driver driver) {
		this.driver = driver;
	}

	public List<String> findTechnologiesKnownByDeveloper(String developerName) {

		String cypher = """
				MATCH (d:Developer {name: $name})
				      -[:KNOWS]->
				      (t:Technology)
				RETURN t.name AS technology
				""";

		try (var session = driver.session()) {

			return session.executeRead(tx -> tx.run(cypher, Map.of("name", developerName))
					.list(record -> record.get("technology").asString()));

		} catch (Neo4jException ex) {
			throw new GraphDatabaseException("Failed to find technologies for developer: " + developerName, ex);
		}
	}

	public Map<String, Object> getDeveloperGraph(String developerName) {

		String cypher = """
				MATCH (d:Developer {name: $name})

				OPTIONAL MATCH (d)-[knows:KNOWS]->(t:Technology)

				OPTIONAL MATCH (d)-[worked:WORKED_ON]->(p:Project)
				OPTIONAL MATCH (p)-[uses:USES]->(usedTech:Technology)

				RETURN d.name AS developer,

				   collect(DISTINCT {
				       technology: t.name,
				       years: knows.years,
				       proficiency: knows.proficiency
				   }) AS knownTechnologies,

				   collect(DISTINCT {
				       project: p.name,
				       durationMonths: worked.durationMonths,
				       role: worked.role
				   }) AS projects,

				   collect(DISTINCT {
				       project: p.name,
				       technology: usedTech.name,
				       version: uses.version
				   }) AS projectTechnologies
				""";

		try (var session = driver.session()) {

			var records = session.executeRead(tx -> tx.run(cypher, Map.of("name", developerName)).list());

			if (records.isEmpty()) {
				throw new DeveloperNotFoundException(developerName);
			}

			return records.get(0).asMap();

		} catch (Neo4jException ex) {
			throw new GraphDatabaseException("Failed to load graph details for developer: " + developerName, ex);
		}
	}

	public Map<String, Object> getGraph(String developerName) {

		String cypher = """
				MATCH (d:Developer {name: $name})
				OPTIONAL MATCH path =
				    (d)-[:KNOWS|WORKED_ON|USES|RELATED_TO*1..2]->(connected)

				RETURN
				    [node IN nodes(path) | {
				        id: elementId(node),
				        label: labels(node)[0],
				        name: node.name
				    }] AS nodes,

				    [rel IN relationships(path) | {
				        id: elementId(rel),
				        type: type(rel),
				        source: elementId(startNode(rel)),
				        target: elementId(endNode(rel))
				    }] AS edges
				""";

		try (var session = driver.session()) {

			List<Map<String, Object>> paths = session
					.executeRead(tx -> tx.run(cypher, Map.of("name", developerName)).list(record -> record.asMap()));

			Map<String, Map<String, Object>> nodes = new LinkedHashMap<>();
			Map<String, Map<String, Object>> edges = new LinkedHashMap<>();

			for (Map<String, Object> path : paths) {

				@SuppressWarnings("unchecked")
				List<Map<String, Object>> pathNodes = (List<Map<String, Object>>) path.get("nodes");

				@SuppressWarnings("unchecked")
				List<Map<String, Object>> pathEdges = (List<Map<String, Object>>) path.get("edges");

				for (Map<String, Object> node : pathNodes) {
					nodes.putIfAbsent(node.get("id").toString(), node);
				}

				for (Map<String, Object> edge : pathEdges) {
					edges.putIfAbsent(edge.get("id").toString(), edge);
				}
			}

			return Map.of("nodes", nodes.values(), "edges", edges.values());

		} catch (Neo4jException ex) {
			throw new GraphDatabaseException("Failed to load relationship graph for developer: " + developerName, ex);
		}
	}

	public List<Map<String, Object>> findRelatedTechnologies(String developerName) {

		String cypher = """
				MATCH (d:Developer {name: $name})
				      -[:WORKED_ON]->
				      (p:Project)
				      -[:USES]->
				      (t:Technology)

				MATCH path =
				      (t)-[:RELATED_TO*1..2]->(related:Technology)

				RETURN DISTINCT
				       p.name AS project,
				       [node IN nodes(path) | node.name] AS path
				""";

		try (var session = driver.session()) {

			return session.executeRead(tx -> tx.run(cypher, Map.of("name", developerName)).list(record -> Map
					.of("project", record.get("project").asString(), "path", record.get("path").asList())));

		} catch (Neo4jException ex) {
			throw new GraphDatabaseException("Failed to find related technologies for developer: " + developerName, ex);
		}
	}
}