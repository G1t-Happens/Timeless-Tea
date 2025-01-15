<template>
  <div class="privacy-policy">
    <h1 class="main-title">Datenschutzerklärung</h1>

    <section>
      <h2>Datensicherheit</h2>
      <p>
        Zum Schutz Ihrer personenbezogenen Daten verwenden wir
        <strong>Secure Socket Layer</strong>-Software (SSL). Diese Technologie verschlüsselt Ihre
        Eingaben, sodass sie für Dritte nicht einsehbar sind. Eine verschlüsselte Verbindung
        erkennen Sie an der Adresszeile <strong>"https://"</strong> und dem Schloss-Symbol in Ihrem
        Browser.
      </p>
    </section>

    <section>
      <h2>Datenerfassung bei Besuch unserer Website</h2>
      <p>
        Der Provider unserer Website speichert automatisch Informationen in sogenannten
        Server-Log-Dateien. Diese umfassen:
      </p>
      <ul>
        <li>Browsertyp und Browserversion</li>
        <li>Verwendetes Betriebssystem</li>
        <li>Referrer-URL</li>
        <li>Hostname des zugreifenden Rechners</li>
        <li>Uhrzeit der Serveranfrage</li>
        <li>IP-Adresse</li>
      </ul>
      <p>
        Diese Daten werden nicht mit anderen Datenquellen zusammengeführt. Grundlage der
        Verarbeitung ist Art. 6 Abs. 1 lit. f DSGVO, da wir ein berechtigtes Interesse an der
        sicheren und fehlerfreien Darstellung unserer Website haben.
      </p>
    </section>

    <section>
      <h2>Cookies</h2>
      <p>
        Unsere Website verwendet Cookies, um die Nutzung benutzerfreundlicher und sicherer zu
        gestalten. Cookies speichern kleine Textinformationen auf Ihrem Gerät, die Ihren Browser
        wiedererkennen. Einige Funktionen unserer Website sind ohne Cookies nicht möglich.
      </p>
      <p>
        Sie können Cookies jederzeit löschen oder in Ihrem Browser deaktivieren. Beachten Sie, dass
        dadurch die Funktionalität unserer Website eingeschränkt sein kann. Informationen zur
        Cookie-Verwaltung finden Sie in den Einstellungen Ihres Browsers.
      </p>
    </section>

    <section>
      <h2>Kundenkonto</h2>
      <p>
        Für mehr Komfort bieten wir ein passwortgeschütztes Kundenkonto an. Mit einem Kundenkonto
        können Sie Ihre Daten einsehen, ändern und für zukünftige Bestellungen speichern. Ihre
        Zugangsdaten behandeln Sie bitte vertraulich. Sie können Ihr Kundenkonto jederzeit löschen.
        Nach geltenden handels- und steuerrechtlichen Vorschriften werden Daten jedoch erst nach
        Ablauf der gesetzlichen Fristen vollständig gelöscht.
      </p>
    </section>

    <section>
      <h2>Bestellungen</h2>
      <p>
        Wir erheben personenbezogene Daten nur, soweit dies für die Abwicklung Ihrer Bestellung
        erforderlich ist. Diese Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. b DSGVO. Ohne Ihre
        ausdrückliche Einwilligung geben wir Ihre Daten nicht an Dritte weiter, außer an
        Dienstleister wie Logistikunternehmen oder Zahlungsdienstleister, die zur Vertragserfüllung
        notwendig sind.
      </p>
    </section>

    <section>
      <h2>Kontaktformular</h2>
      <p>
        Daten, die Sie über das Kontaktformular übermitteln, verwenden wir ausschließlich zur
        Bearbeitung Ihrer Anfrage. Die Verarbeitung erfolgt auf Basis Ihrer Einwilligung gemäß Art.
        6 Abs. 1 lit. a DSGVO. Sie können Ihre Einwilligung jederzeit widerrufen.
      </p>
    </section>

    <section>
      <h2>Newsletter</h2>
      <p>
        Mit Ihrer Zustimmung nutzen wir Ihre E-Mail-Adresse für den Versand unseres Newsletters. Die
        Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. a DSGVO. Sie können den Newsletter jederzeit
        über den Abmeldelink im Newsletter oder durch eine Nachricht an uns abbestellen.
      </p>
    </section>

    <section>
      <h2>Zahlungen</h2>
      <p>
        Ihre Zahlungsinformationen verwenden wir ausschließlich zur Zahlungsabwicklung. Je nach
        gewählter Zahlungsart werden diese Informationen an den entsprechenden Zahlungsdienstleister
        übermittelt. Die Verarbeitung erfolgt auf Basis von Art. 6 Abs. 1 lit. b und f DSGVO.
      </p>
    </section>

    <section>
      <h2>Externe Dienste</h2>
      <p>
        Unsere Website verwendet externe Dienste wie Google Analytics und Social-Media-Plugins (z.
        B. Facebook, Instagram). Diese Dienste können Cookies setzen und pseudonyme Nutzungsprofile
        erstellen. Detaillierte Informationen zu diesen Diensten und Ihren Widerspruchsmöglichkeiten
        finden Sie in unserer vollständigen Datenschutzerklärung.
      </p>
    </section>

    <section>
      <h2>Rechte und Kontakt</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung
        Ihrer Daten sowie das Recht auf Widerspruch und Datenübertragbarkeit gemäß DSGVO. Bei Fragen
        oder zur Ausübung Ihrer Rechte wenden Sie sich bitte per E-Mail an uns:
        <a href="mailto:info@timelesstea.com" class="email-link">info@timelesstea.com</a>.
      </p>
    </section>
  </div>
</template>

<script setup></script>

<style scoped>
.privacy-policy {
  font-family: 'Roboto', sans-serif;
  line-height: 1.8;
  margin: 40px auto;
  max-width: 1400px;
  padding: 20px;
  background: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
}

.main-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.privacy-policy h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #555;
}

.privacy-policy p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: #666;
}

.privacy-policy ul {
  list-style-type: none;
  padding-left: 0;
}

.privacy-policy ul li {
  font-size: 1rem;
  margin: 5px 0;
  color: #555;
  text-align: left;
}

.email-link {
  color: #007bff;
  text-decoration: none;
}

.email-link:hover {
  text-decoration: underline;
}
</style>
