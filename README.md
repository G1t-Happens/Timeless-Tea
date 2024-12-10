# Aufgabe 4


## Admin-View zum testen von den CRUD Operationen sowie Suche nach Name und Kategorienfilter:
### http://localhost:5173/admin

Aufgabe 4:
- [X] CRUD Operationen implementiert - alles im responsive design
  - Man kann per "Neuen Artikel erstellen" - Button neue Artikel erstellen (Create)
  - Man kann alle Produkte anzeigen lassen (READ) - Default view
  - Man kann per "Bearbeiten" - Button sich einzelne Produkte anhand der ID anzeigen lassen (READ)
  - Man kann nach dem man den "Bearbeiten" - Button geklickt hat Produkte aendern und Updaten (Update)
  - Man kann per "Loeschen" - Button Produkte deleten (Delete)

- [X] Suchfunktion im Responsive Design implementiert
- [X] Online-Datenbank verbunden & fuer prod konfiguriert
- [X] "Product"- Entity erstellt mit 1:n Beziehung zu Category/Rating (da zuvor n:m Beziehungen zwischen <br>
Product und Category/Rating, wurden die JoinTables "ProductCategory" und "ProductRating"eingefuehrt
- [X] Suchfunktion um Filterparameter(Geschmack, Wirkung, Bewertung und Preis) erweitert
