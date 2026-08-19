package com.dhanraj.graph.app.config;

import java.util.Map;

import org.neo4j.driver.Driver;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class GraphSeed implements CommandLineRunner {

	private final Driver driver;

	public GraphSeed(Driver driver) {
		this.driver = driver;
	}

	@Override
	public void run(String... args) {

		String cypher = """
				MERGE (d:Developer {name: $developer})

				MERGE (java:Technology {name: 'Java'})
				MERGE (react:Technology {name: 'React'})
				MERGE (spring:Technology {name: 'Spring Boot'})
				MERGE (kafka:Technology {name: 'Kafka'})
				MERGE (microservices:Technology {name: 'Microservices'})

				MERGE (project:Project {name: 'Developer Knowledge Platform'})

				MERGE (d)-[:KNOWS {
				    years: 3,
				    proficiency: 'Advanced'
				}]->(java)

				MERGE (d)-[:KNOWS {
				    years: 2,
				    proficiency: 'Advanced'
				}]->(react)

				MERGE (d)-[:KNOWS {
				    years: 2,
				    proficiency: 'Intermediate'
				}]->(kafka)

				MERGE (d)-[:WORKED_ON {
				    durationMonths: 12,
				    role: 'Software Developer'
				}]->(project)

				MERGE (project)-[:USES {version: '21'}]->(java)
				MERGE (project)-[:USES {version: '3.x'}]->(spring)
				MERGE (project)-[:USES {version: '18'}]->(react)
				MERGE (project)-[:USES {version: '3.x'}]->(kafka)

				MERGE (java)-[:RELATED_TO]->(spring)
				MERGE (spring)-[:RELATED_TO]->(microservices)
				MERGE (kafka)-[:RELATED_TO]->(microservices)
				""";

		try (var session = driver.session()) {
			session.executeWrite(tx -> {
				tx.run(cypher, Map.of("developer", "Dhanraj"));
				return null;
			});
		}

		System.out.println("Graph seed completed.");
	}
}