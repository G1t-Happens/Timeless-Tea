<template>
  <div class="faq-page">
    <h1>Fragen & Antworten</h1>
    <p class="intro-text">
      Hier findest du Antworten auf die häufigsten Fragen zur Nutzung von Timeless Tea. <br />
      Dieser Bereich deckt allgemeine Fragen ab.
    </p>

    <div class="faq-grid">
      <!-- Frage 1 -->
      <div class="faq-card">
        <h2>Kann ich meine Bestellung nachträglich ändern?</h2>
        <p>
          Änderungen an deiner Bestellung sind möglich, solange die Bestellung noch nicht versandt
          wurde. Kontaktiere dazu bitte umgehend unseren Kundenservice per E-Mail oder Telefon.
          Unsere Mitarbeiter helfen dir gerne weiter.
        </p>
      </div>

      <!-- Frage 2 -->
      <div class="faq-card">
        <h2>Welche Zahlungsmethoden sind verfügbar?</h2>
        <p>
          Bei Timeless Tea kannst du aus verschiedenen sicheren Zahlungsmethoden wählen, darunter:
        </p>
        <ul>
          <li>PayPal und PayPal Express</li>
          <li>Kreditkarten (Visa, MasterCard, American Express)</li>
          <li>Klarna Rechnungskauf</li>
          <li>Sofortüberweisung</li>
        </ul>
        <p>
          Deine Zahlungsdaten werden verschlüsselt übertragen, um maximale Sicherheit zu
          gewährleisten.
        </p>
      </div>

      <!-- Frage 3 -->
      <div class="faq-card">
        <h2>Wie funktioniert die Teesuche?</h2>
        <p>
          Unsere Teesuche wurde entwickelt, um dir den perfekten Tee zu empfehlen. Nutze die
          Filteroptionen auf unserer Website, um Tees nach Geschmack, Herkunft oder Wirkung zu
          finden. Außerdem bieten wir personalisierte Vorschläge basierend auf deinen bisherigen
          Bestellungen und Präferenzen.
        </p>
      </div>

      <!-- Frage 4 -->
      <div class="faq-card">
        <h2>Wie lange dauert der Versand?</h2>
        <p>
          Standardversand innerhalb Deutschlands dauert 2–4 Werktage. Expressversand ist ebenfalls
          verfügbar und garantiert eine Lieferung am nächsten Werktag, wenn du vor 12:00 Uhr
          bestellst. Für internationale Bestellungen beträgt die Lieferzeit 5–10 Werktage, abhängig
          vom Zielland.
        </p>
      </div>

      <!-- Frage 5 -->
      <div class="faq-card">
        <h2>Wie kann ich meinen Account löschen?</h2>
        <p>
          Das Löschen deines Accounts tut uns leid, ist aber möglich. Sende uns eine schriftliche
          Anfrage per E-Mail mit deinem Anliegen und deiner registrierten E-Mail-Adresse. Beachte,
          dass alle gespeicherten Daten nach den gesetzlichen Anforderungen gelöscht werden.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.faq-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

h1 {
  font-size: 28px;
  margin-bottom: 15px;
  color: #c06e52;
  text-align: center;
}

.intro-text {
  text-align: center;
  margin-bottom: 30px;
  font-size: 18px;
  color: #555;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.faq-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.faq-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #7a844b;
}

p,
ul {
  margin-bottom: 10px;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 5px;
}
</style>
