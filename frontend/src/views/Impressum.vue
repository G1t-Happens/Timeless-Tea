<template>
  <div class="impressum-page">
    <!-- BackButton-Komponente -->
    <BackButton />
    <h1>Impressum</h1>
    <p class="intro-text">Angaben gemäß § 5 TMG</p>

    <div class="impressum-grid">
      <!-- Verantwortliches Unternehmen -->
      <div class="card">
        <h2>Verantwortliches Unternehmen</h2>
        <p>XYK GmbH</p>
        <p>Musterweg 42</p>
        <p>12345 Beispielfeld</p>
        <p>Deutschland</p>
      </div>

      <!-- Geschäftsführung -->
      <div class="card">
        <h2>Geschäftsführung</h2>
        <p>Max Mustergeschäft</p>
        <p>Lisa Beispielmann</p>
      </div>

      <!-- Kontakt -->
      <div class="card">
        <h2>Kontakt</h2>
        <p>Telefon: +49 (0) 987 654 321</p>
        <p>Telefax: +49 (0) 123 456 789</p>
        <p>
          E-Mail: <a href="mailto:info@musterfirma.de" class="contact-link">info@musterfirma.de</a>
        </p>
      </div>

      <!-- Handelsregister -->
      <div class="card">
        <h2>Registereintrag</h2>
        <p>Eintragung im Handelsregister</p>
        <p>Registergericht: Amtsgericht Fantasiestadt</p>
        <p>Registernummer: HRB 987654</p>
      </div>

      <!-- Umsatzsteuer-ID -->
      <div class="card">
        <h2>Umsatzsteuer-ID</h2>
        <p>Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:</p>
        <p>DE 987654321</p>
      </div>

      <!-- Verantwortlich nach RStV -->
      <div class="card">
        <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p>Max Mustermacher</p>
        <p>Musterweg 42</p>
        <p>12345 Beispielfeld</p>
      </div>

      <!-- Bio-Zertifizierung -->
      <div class="card">
        <h2>Bio-Zertifizierung</h2>
        <p>DE-ÖKO-000</p>
        <p>Certified organic by Mustermann GmbH</p>
      </div>

      <!-- Technik, Design und Umsetzung -->
      <div class="card">
        <h2>Technik, Design und Umsetzung</h2>
        <p>A fictional digital story by NoName AG</p>
        <p>Umsetzung mit dem Content Management System ExampleCMS,</p>
        <p>der E-Commerce Software ExampleCommerce.</p>
        <p>
          <a href="https://example.com" target="_blank" class="contact-link">www.example.com</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import BackButton from '@/components/navigation/BackButton.vue'
</script>

<style scoped>
.impressum-page {
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

.impressum-grid {
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

.contact-link {
  color: #c06e52;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #a35b42;
}
</style>
