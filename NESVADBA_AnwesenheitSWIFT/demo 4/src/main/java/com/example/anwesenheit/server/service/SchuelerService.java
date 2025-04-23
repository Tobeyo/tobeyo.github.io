package com.example.anwesenheit.server.service;

import com.example.anwesenheit.persistence.entities.Schueler;
import com.example.anwesenheit.persistence.repositories.SchuelerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchuelerService {
    
    @Autowired
    private SchuelerRepository schuelerRepository;
    
    public List<Schueler> getAllSchueler() {
        return schuelerRepository.findAll();
    }
    
    public Schueler addSchueler(Schueler schueler) {
        return schuelerRepository.save(schueler);
    }
    
    public void deleteSchueler(Long id) {
        schuelerRepository.deleteById(id);
    }
} 