package com.example.anwesenheit.persistence.repositories;

import com.example.anwesenheit.persistence.entities.Schueler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchuelerRepository extends JpaRepository<Schueler, Long> {
} 