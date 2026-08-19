package com.dhanraj.graph.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

	@Value("${frontend.origin:http://localhost:5173}")
	private String frontendOrigin;

	@Bean
	public CorsFilter corsFilter() {

		CorsConfiguration configuration = new CorsConfiguration();

		configuration.addAllowedOrigin(frontendOrigin);
		configuration.addAllowedMethod("*");
		configuration.addAllowedHeader("*");

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

		source.registerCorsConfiguration("/**", configuration);

		return new CorsFilter(source);
	}
}