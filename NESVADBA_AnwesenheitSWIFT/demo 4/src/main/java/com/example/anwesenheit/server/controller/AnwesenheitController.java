package com.example.anwesenheit.server.controller;

import com.example.anwesenheit.persistence.entities.Anwesenheitseintrag;
import com.example.anwesenheit.server.service.AnwesenheitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/anwesenheit")
public class AnwesenheitController {
    
    @Autowired
    private AnwesenheitService anwesenheitService;
    
    @PostMapping
    public Anwesenheitseintrag addAnwesenheitseintrag(
            @RequestParam Long schuelerId,
            @RequestParam boolean anwesend,
            @RequestParam(required = false) LocalDateTime zeitpunkt) {
        if (zeitpunkt == null) {
            zeitpunkt = LocalDateTime.now();
        }
        return anwesenheitService.addAnwesenheitseintrag(schuelerId, anwesend, zeitpunkt);
    }
    
    @GetMapping
    public List<Anwesenheitseintrag> getAnwesenheitenByDate(@RequestParam LocalDate datum) {
        return anwesenheitService.getAnwesenheitenByDate(datum);
    }
} 