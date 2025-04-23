package com.example.anwesenheit.persistence.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;

@Entity
public class Anwesenheitseintrag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Schueler schueler;
    
    private boolean anwesend;
    private LocalDateTime zeitpunkt;


    // Konstruktoren
    public Anwesenheitseintrag() {}
    
    public Anwesenheitseintrag(Schueler schueler, boolean anwesend, LocalDateTime zeitpunkt) {
        this.schueler = schueler;
        this.anwesend = anwesend;
        this.zeitpunkt = zeitpunkt;
    }
    
    // Getter und Setter
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Schueler getSchueler() {
        return schueler;
    }
    
    public void setSchueler(Schueler schueler) {
        this.schueler = schueler;
    }
    
    public boolean isAnwesend() {
        return anwesend;
    }
    
    public void setAnwesend(boolean anwesend) {
        this.anwesend = anwesend;
    }
    
    public LocalDateTime getZeitpunkt() {
        return zeitpunkt;
    }
    
    public void setZeitpunkt(LocalDateTime zeitpunkt) {
        this.zeitpunkt = zeitpunkt;
    }
} 