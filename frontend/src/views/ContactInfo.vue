<template>
  <div class="contact-page">
    <h1>Kontakt</h1>
    <p class="intro-text">
      Hast du Fragen, Anliegen oder Feedback? <br />
      Unser Team von Timeless Tea ist gerne für dich da!
    </p>

    <div class="card-grid">
      <!-- E-Mail -->
      <div class="card">
        <h2>E-Mail</h2>
        <p>
          Schreibe uns eine E-Mail, und wir kümmern uns um dein Anliegen:
          <br />
          <a href="mailto:support@timelesstea.de" class="contact-link">support@timelesstea.de</a>
        </p>
        <p>Wir bemühen uns, alle Anfragen innerhalb von 24 Stunden zu beantworten.</p>
      </div>

      <!-- Telefon -->
      <div class="card">
        <h2>Telefon</h2>
        <p>
          Du möchtest lieber persönlich mit uns sprechen? Unser Kundenservice steht dir während
          unserer Geschäftszeiten telefonisch zur Verfügung:
        </p>
        <p><strong>Telefonnummer:</strong> +49 (0) 123 456 789</p>
        <p><strong>Geschäftszeiten:</strong> Montag bis Freitag, 09:00–18:00 Uhr</p>
      </div>

      <!-- Social Media -->
      <div class="card">
        <h2>Social Media</h2>
        <p>
          Folge uns auf unseren Social-Media-Kanälen, um keine Neuigkeiten, Aktionen oder spannenden
          Inhalte zu verpassen:
        </p>
        <ul>
          <li>
            <a href="https://instagram.com/timeless_tea" target="_blank" class="contact-link"
              >Instagram: @timeless_tea</a
            >
          </li>
          <li>
            <a href="https://facebook.com/timelesstea" target="_blank" class="contact-link"
              >Facebook: Timeless Tea</a
            >
          </li>
        </ul>
      </div>

      <!-- FAQ -->
      <div class="card">
        <h2>Häufige Fragen (FAQ)</h2>
        <p>
          Vielleicht findest du die Antwort auf deine Frage schon in unserem FAQ-Bereich. Dort haben
          wir die häufigsten Themen wie Bestellungen, Versand oder Rückgaben übersichtlich für dich
          zusammengestellt.
          <router-link to="/faq" class="contact-link"
            >Hier klicken, um die FAQs anzusehen
          </router-link>
        </p>
      </div>

      <!-- Rückgabe & Umtausch -->
      <div class="card">
        <h2>Rückgabe & Umtausch</h2>
        <p>
          Falls du ein Produkt zurückgeben oder umtauschen möchtest, findest du alle relevanten
          Informationen im Bereich Rückgabe & Umtausch.
          <router-link to="/returns" class="contact-link"
            >Hier klicken, um mehr zu erfahren
          </router-link>
        </p>
      </div>

      <!-- Kontaktformular -->
      <div class="card">
        <h2>Kontaktformular</h2>
        <p>
          Nutze unser Kontaktformular, um uns direkt eine Nachricht zu senden.
          <router-link :to="{ name: 'ContactForm' }" class="btn btn-secondary"
            >Zum Kontaktformular
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.contact-page {
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

p {
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 5px;
}

.contact-link {
  color: #c06e52;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #a35b42;
}

.btn {
  display: inline-block;
  padding: 10px 15px;
  font-size: 16px;
  text-decoration: none;
  text-align: center;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}
</style>
