<template>
  <div class="return-page">
    <h1>Rückgabe & Umtausch</h1>
    <p class="intro-text">
      Wir bei Timeless Tea möchten sicherstellen, dass du mit deinen Einkäufen rundum zufrieden
      bist. Falls ein Artikel jedoch nicht deinen Erwartungen entspricht, bieten wir dir eine
      unkomplizierte Rückgabe- und Umtauschmöglichkeit.
    </p>

    <div class="card-grid">
      <!-- Rückgabebedingungen -->
      <div class="card">
        <h2>Rückgabebedingungen</h2>
        <ul>
          <li>
            <strong>Zeitraum:</strong> Rückgaben sind innerhalb von 14 Tagen nach Erhalt der Ware
            möglich.
          </li>
          <li>
            <strong>Ungeöffnete Produkte:</strong> Aus hygienischen Gründen können nur ungeöffnete
            und unbeschädigte Tees zurückgegeben werden. Sollte die Verpackung beschädigt sein, ist
            eine Rückgabe ausgeschlossen.
          </li>
          <li>
            <strong>Rücksendekosten:</strong> Die Kosten der Rücksendung trägt der Käufer, es sei
            denn, die Rückgabe erfolgt aufgrund eines Fehlers unsererseits (z. B. falsches Produkt
            oder beschädigte Ware).
          </li>
        </ul>
      </div>

      <!-- Umtauschbedingungen -->
      <div class="card">
        <h2>Umtauschbedingungen</h2>
        <ul>
          <li>
            <strong>Beschädigte oder falsche Artikel:</strong> Wenn ein Artikel beschädigt geliefert
            wurde oder du einen falschen Artikel erhalten hast, bieten wir einen kostenfreien
            Umtausch an. Hierbei muss der Kunde den Support innerhalb von 7 Tagen nach Erhalt
            kontaktieren.
          </li>
          <li>
            <strong>Umtauschzeitraum:</strong> Umtauschanfragen müssen ebenfalls innerhalb von 14
            Tagen nach Erhalt des Artikels gestellt werden.
          </li>
          <li>
            <strong>Verfügbarkeit des Ersatzartikels:</strong> Der Umtausch ist abhängig von der
            Verfügbarkeit des gewünschten Ersatzprodukts. Sollte der Artikel nicht vorrätig sein,
            bieten wir dir an, den Kaufpreis zu erstatten oder einen alternativen Artikel
            auszuwählen.
          </li>
        </ul>
      </div>

      <!-- Rückgabeprozess -->
      <div class="card">
        <h2>Rückgabeprozess</h2>
        <ol>
          <li>
            <strong>Kontaktaufnahme:</strong> Wende dich zuerst an unseren Kundenservice über die
            App (unter Kontakt) oder per E-Mail, um die Rückgabe oder den Umtausch zu initiieren.
            Gib hierbei bitte deine Bestellnummer an.
          </li>
          <li>
            <strong>Rücksendeanweisungen:</strong> Nach Rücksprache mit unserem Kundenservice
            erhältst du genaue Anweisungen zur Rücksendung des Produkts. Verpacke die Artikel sicher
            und füge das Rücksendeformular bei, das wir dir zur Verfügung stellen.
          </li>
          <li>
            <strong>Rückerstattung:</strong> Nach Erhalt und Überprüfung des zurückgesandten
            Artikels erfolgt die Erstattung innerhalb von 7 Werktagen auf das ursprünglich
            verwendete Zahlungsmittel, sofern die Rückgabe den oben genannten Bedingungen
            entspricht.
          </li>
        </ol>
      </div>

      <!-- Wichtige Hinweise -->
      <div class="card">
        <h2>Wichtige Hinweise</h2>
        <ul>
          <li>
            <strong>Fehlende Teile oder Zubehör:</strong> Wenn ein Artikel unvollständig
            zurückgeschickt wird (z. B. ohne beigefügte Proben oder Zubehör), kann dies die
            Rückerstattung verzögern oder mindern.
          </li>
          <li>
            <strong>Austausch gegen Gutscheine:</strong> Auf Wunsch bieten wir die Möglichkeit, den
            erstatteten Betrag als Gutschein für zukünftige Einkäufe zu nutzen.
          </li>
          <li>
            <strong>Bearbeitungszeitraum:</strong> Beachte, dass die Bearbeitung von Rückgaben und
            Umtausch bis zu 10 Werktage dauern kann.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.return-page {
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #7a844b;
}

ul,
ol {
  padding-left: 20px;
  margin: 10px 0;
}

li {
  margin-bottom: 10px;
}

li strong {
  color: #c06e52;
}
</style>
