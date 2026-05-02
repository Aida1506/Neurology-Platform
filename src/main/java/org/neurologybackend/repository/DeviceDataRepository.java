package org.neurologybackend.repository;

import org.neurologybackend.model.DeviceData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeviceDataRepository extends JpaRepository<DeviceData, Long> {

    List<DeviceData> findByUsernameOrderByTimestampDesc(String username);
}

