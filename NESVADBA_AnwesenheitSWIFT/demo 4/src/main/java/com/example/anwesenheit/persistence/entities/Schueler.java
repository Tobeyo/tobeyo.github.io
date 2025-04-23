package com.example.anwesenheit.persistence.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import java.util.List;

@Entity
public class Schueler {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private int lfdNr;
    private String name;
    
    @OneToMany(mappedBy = "schueler")
    @JsonIgnore
    private List<Anwesenheitseintrag> anwesenheitseintraege;
    
    // Konstruktoren
    public Schueler() {}
    
    public Schueler(int lfdNr, String name) {
        this.lfdNr = lfdNr;
        this.name = name;
    }
    
    // Getter und Setter
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public int getLfdNr() {
        return lfdNr;
    }
    
    public void setLfdNr(int lfdNr) {
        this.lfdNr = lfdNr;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public List<Anwesenheitseintrag> getAnwesenheitseintraege() {
        return anwesenheitseintraege;
    }
    
    public void setAnwesenheitseintraege(List<Anwesenheitseintrag> anwesenheitseintraege) {
        this.anwesenheitseintraege = anwesenheitseintraege;
    }
} 