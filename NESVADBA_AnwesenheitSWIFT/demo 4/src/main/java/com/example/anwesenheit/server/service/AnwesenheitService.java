package com.example.anwesenheit.server.service;

import com.example.anwesenheit.persistence.entities.Anwesenheitseintrag;
import com.example.anwesenheit.persistence.entities.Schueler;
import com.example.anwesenheit.persistence.repositories.AnwesenheitseintragRepository;
import com.example.anwesenheit.persistence.repositories.SchuelerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AnwesenheitService {
    
    @Autowired
    private AnwesenheitseintragRepository anwesenheitseintragRepository;
    
    @Autowired
    private SchuelerRepository schuelerRepository;
    
    public Anwesenheitseintrag addAnwesenheitseintrag(Long schuelerId, boolean anwesend, LocalDateTime zeitpunkt) {
        Schueler schueler = schuelerRepository.findById(schuelerId)
            .orElseThrow(() -> new RuntimeException("Schüler nicht gefunden"));
        
        Anwesenheitseintrag eintrag = new Anwesenheitseintrag(schueler, anwesend, zeitpunkt);
        return anwesenheitseintragRepository.save(eintrag);
    }
    
    public List<Anwesenheitseintrag> getAnwesenheitenByDate(LocalDate datum) {
        LocalDateTime start = LocalDateTime.of(datum, LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(datum, LocalTime.MAX);
        return anwesenheitseintragRepository.findByZeitpunktBetween(start, end);
    }
} 