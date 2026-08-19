package com.dhanraj.graph.app.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.dhanraj.graph.app.service.DeveloperService;

@RestController
@RequestMapping("/api/developers")
public class DeveloperController {

	private final DeveloperService developerService;

	public DeveloperController(DeveloperService developerService) {
		this.developerService = developerService;
	}

	@GetMapping("/{name}/technologies")
	public List<String> getTechnologies(@PathVariable String name) {
		return developerService.findTechnologies(name);
	}

	@GetMapping("/{name}/recommendations")
	public List<Map<String, Object>> getRecommendations(@PathVariable String name) {

		return developerService.findRelatedTechnologies(name);
	}

	@GetMapping("/{name}/graph")
	public Map<String, Object> getDeveloperGraph(@PathVariable String name) {

		return developerService.getDeveloperGraph(name);
	}

	@GetMapping("/{name}/graph/relationships")
	public Map<String, Object> getGraph(@PathVariable String name) {
		return developerService.getGraph(name);
	}
}