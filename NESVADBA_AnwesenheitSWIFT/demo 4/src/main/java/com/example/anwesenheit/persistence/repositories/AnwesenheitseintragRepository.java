package com.example.anwesenheit.persistence.repositories;

import com.example.anwesenheit.persistence.entities.Anwesenheitseintrag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnwesenheitseintragRepository extends JpaRepository<Anwesenheitseintrag, Long> {
    List<Anwesenheitseintrag> findByZeitpunktBetween(LocalDateTime start, LocalDateTime end);
} 