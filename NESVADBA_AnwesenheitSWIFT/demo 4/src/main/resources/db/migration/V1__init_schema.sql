CREATE TABLE schueler (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lfd_nr INT NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE anwesenheitseintrag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    schueler_id BIGINT NOT NULL,
    anwesend BOOLEAN NOT NULL,
    zeitpunkt TIMESTAMP NOT NULL,
    FOREIGN KEY (schueler_id) REFERENCES schueler(id)
); 