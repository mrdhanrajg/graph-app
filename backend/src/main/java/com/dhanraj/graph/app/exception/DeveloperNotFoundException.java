package com.dhanraj.graph.app.exception;

public class DeveloperNotFoundException extends RuntimeException {

	public DeveloperNotFoundException(String developerName) {
		super("Developer '" + developerName + "' was not found.");
	}
}