package com.example.anwesenheit.server.controller;

import com.example.anwesenheit.persistence.entities.Schueler;
import com.example.anwesenheit.server.service.SchuelerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schueler")
public class SchuelerController {
    
    @Autowired
    private SchuelerService schuelerService;
    
    @GetMapping
    public List<Schueler> getAllSchueler() {
        return schuelerService.getAllSchueler();
    }
    
    @PostMapping
    public Schueler addSchueler(@RequestBody Schueler schueler) {
        return schuelerService.addSchueler(schueler);
    }
    
    @DeleteMapping("/{id}")
    public void deleteSchueler(@PathVariable Long id) {
        schuelerService.deleteSchueler(id);
    }
} 