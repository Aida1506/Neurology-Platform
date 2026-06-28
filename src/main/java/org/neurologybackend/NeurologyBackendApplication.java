package org.neurologybackend;

import org.neurologybackend.service.DoctorService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class NeurologyBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(NeurologyBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner syncDoctorUsersOnStartup(DoctorService doctorService) {
        return args -> doctorService.syncDoctorUsers();
    }
}
