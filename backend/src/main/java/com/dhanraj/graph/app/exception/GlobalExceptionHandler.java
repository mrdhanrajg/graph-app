package com.dhanraj.graph.app.exception;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(GraphDatabaseException.class)
	public ResponseEntity<Map<String, Object>> handleGraphDatabaseException(GraphDatabaseException ex) {

		return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("timestamp", Instant.now().toString(),
				"error", "DATABASE_UNAVAILABLE", "message", "The graph database is currently unavailable."));
	}

	@ExceptionHandler(DeveloperNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleDeveloperNotFound(DeveloperNotFoundException ex) {

		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("error", "DEVELOPER_NOT_FOUND", "message", ex.getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleUnexpectedException(Exception ex) {

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("timestamp", Instant.now().toString(), "error", "INTERNAL_SERVER_ERROR", "message",
						"An unexpected error occurred."));
	}
}