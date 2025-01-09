<template>
  <div class="info-page">
    <!-- Verwende die BackButton-Komponente -->
    <BackButton />
    <section class="shipping-section">
      <h1>Versand & Lieferung</h1>
      <p>
        Wir bei Timeless Tea möchten sicherstellen, dass deine Bestellung schnell und zuverlässig
        bei dir ankommt. Hier findest du alle wichtigen Informationen zu unserem Versandservice:
      </p>

      <div class="shipping-info">
        <h2>Versandkosten</h2>
        <ul>
          <li>Standardversand (innerhalb Deutschlands): 3,99 €</li>
          <li>Kostenloser Versand ab einem Bestellwert von 30 €</li>
          <li>Expressversand (innerhalb Deutschlands): 9,99 €</li>
          <li>
            Versand ins Ausland: Versandkosten variieren je nach Land und werden im Bestellprozess
            angezeigt
          </li>
        </ul>
      </div>

      <div class="delivery-times">
        <h2>Lieferzeit</h2>
        <ul>
          <li>Standardversand: 2–4 Werktage innerhalb Deutschlands</li>
          <li>Expressversand: Zustellung am nächsten Werktag (bei Bestellungen vor 12:00 Uhr)</li>
          <li>Auslandslieferung: 5–10 Werktage, abhängig vom Zielland</li>
        </ul>
      </div>

      <div class="delivery-partners">
        <h2>Lieferpartner</h2>
        <p>
          Unsere Bestellungen werden mit zuverlässigen Partnern wie DHL, DPD oder Hermes verschickt,
          abhängig von deinem Standort und der gewählten Versandart. Alle Sendungen sind vollständig
          nachverfolgbar. Du erhältst eine Sendungsverfolgungsnummer, sobald deine Bestellung
          versendet wurde.
        </p>
      </div>

      <div class="delivery-changes">
        <h2>Lieferadresse ändern</h2>
        <p>
          Solltest du deine Lieferadresse nach Abschluss der Bestellung ändern müssen, kontaktiere
          bitte schnellstmöglich unseren Kundenservice. Änderungen sind nur möglich, solange die
          Bestellung noch nicht versandt wurde.
        </p>
      </div>

      <div class="delivery-problems">
        <h2>Probleme bei der Lieferung</h2>
        <h3>Paket nicht erhalten?</h3>
        <p>
          Überprüfe zuerst die Sendungsverfolgung. Falls dein Paket dennoch nicht zugestellt wurde,
          wende dich bitte an unseren Kundenservice. Wir klären das Problem schnellstmöglich für
          dich.
        </p>
        <h3>Beschädigte Lieferung</h3>
        <p>
          Sollte dein Paket beschädigt ankommen, dokumentiere den Schaden bitte mit Fotos und
          kontaktiere uns direkt. Wir kümmern uns um eine schnelle Lösung.
        </p>
      </div>
    </section>

    <section class="payment-section">
      <h1>Zahlungsmethoden</h1>

      <div class="payment-info">
        <h2>PayPal und PayPal Express</h2>
        <p>Online sicher bezahlen über Ihr PayPal-Konto mit E-Mail-Adresse und Passwort.</p>

        <h2>Kreditkarte</h2>
        <p>Sie haben die Wahl zwischen Visa, MasterCard oder American Express.</p>

        <h2>Rechnung</h2>
        <p>
          Zahlen Sie nach Erhalt Ihrer Ware bequem per Rechnung binnen 30 Tagen über unseren
          Zahlungspartner Klarna.
        </p>
      </div>
    </section>

    <section class="contact-section">
      <h1>Kontakt</h1>
      <p>
        Falls du noch Fragen zu unserem Versand oder unseren Zahlungsmethoden hast, zögere nicht,
        uns zu kontaktieren. Unser Kundenservice hilft dir gerne weiter!
      </p>
      <button @click="contactSupport" class="btn-contact">
        Hier klicken, um uns zu kontaktieren
      </button>
    </section>
  </div>
</template>

<script setup>
// Dummy-Klick-Handler für den Kontakt-Button
import BackButton from '@/components/navigation/BackButton.vue'

const contactSupport = () => {
  alert('Kundenservice wird kontaktiert!')
}
</script>

<style scoped>
.info-page {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  color: #333;
}

h1 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #c06e52;
}

h2 {
  font-size: 20px;
  margin-top: 20px;
  margin-bottom: 10px;
}

h3 {
  font-size: 18px;
  margin-top: 15px;
  margin-bottom: 5px;
}

ul {
  padding-left: 20px;
}

ul li {
  margin-bottom: 5px;
}

section {
  margin-bottom: 40px;
}

.btn-contact {
  background-color: #c06e52;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-contact:hover {
  background-color: #8f4c37;
}

.payment-section,
.shipping-section {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  background-color: #f9f9f9;
}

.contact-section {
  text-align: center;
}

.contact-section button {
  display: inline-block;
  margin-top: 15px;
}
</style>
