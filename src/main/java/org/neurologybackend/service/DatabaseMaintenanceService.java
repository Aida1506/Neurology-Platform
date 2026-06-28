package org.neurologybackend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DatabaseMaintenanceService {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public DatabaseMaintenanceService(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void maintainUsersTable() {
        Integer emailColumns = jdbcTemplate.queryForObject(
                "select count(*) from information_schema.columns where table_schema = database() and table_name = 'users' and column_name = 'email'",
                Integer.class
        );

        if (emailColumns == null || emailColumns == 0) {
            jdbcTemplate.execute("alter table users add column email varchar(255) null");
        }

        Integer emailIndexes = jdbcTemplate.queryForObject(
                "select count(*) from information_schema.statistics where table_schema = database() and table_name = 'users' and index_name = 'uk_users_email'",
                Integer.class
        );

        if (emailIndexes == null || emailIndexes == 0) {
            jdbcTemplate.execute("create unique index uk_users_email on users (email)");
        }

        migratePlainTextPasswords();
    }

    private void migratePlainTextPasswords() {
        List<Map<String, Object>> users = jdbcTemplate.queryForList(
                "select id, password from users where password is not null and password not like '$2a$%' and password not like '$2b$%' and password not like '$2y$%'"
        );

        for (Map<String, Object> user : users) {
            Object password = user.get("password");
            Object id = user.get("id");
            if (password instanceof String rawPassword && !rawPassword.isBlank()) {
                jdbcTemplate.update(
                        "update users set password = ? where id = ?",
                        passwordEncoder.encode(rawPassword),
                        id
                );
            }
        }
    }
}
