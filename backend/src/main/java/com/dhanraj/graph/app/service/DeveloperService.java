package com.dhanraj.graph.app.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.dhanraj.graph.app.repository.GraphRepository;

@Service
public class DeveloperService {

	private final GraphRepository graphRepository;

	public DeveloperService(GraphRepository graphRepository) {
		this.graphRepository = graphRepository;
	}

	public List<String> findTechnologies(String developerName) {
		return graphRepository.findTechnologiesKnownByDeveloper(developerName);
	}

	public List<Map<String, Object>> findRelatedTechnologies(String developerName) {
		return graphRepository.findRelatedTechnologies(developerName);
	}

	public Map<String, Object> getDeveloperGraph(String developerName) {
		return graphRepository.getDeveloperGraph(developerName);
	}

	public Map<String, Object> getGraph(String developerName) {
	    return graphRepository.getGraph(developerName);
	}
}