module.exports.bootstrap = async function() {
  sails.log.info('Bootstrapping application...');

  // Anzahl existierender User prüfen
  const userCount = await User.count();
  if (userCount === 0) {

    // Feste Adressdaten anlegen
    const adminAddress = await Address.create({
      country: 'Germany',
      state: 'Bayern',
      city: 'Munich',
      postalCode: '80331',
      street: 'Marienplatz',
      houseNumber: '1',
      addressAddition: ''
    }).fetch();

    const normalUserAddress = await Address.create({
      country: 'Germany',
      state: 'Berlin',
      city: 'Berlin',
      postalCode: '10117',
      street: 'Unter den Linden',
      houseNumber: '12A',
      addressAddition: 'Hinterhaus'
    }).fetch();

    // SuperAdmin User erstellen und mit der Adresse verknüpfen
    await User.create({
      emailAddress: 'admin@example.com',
      firstName: 'Daniel',
      lastName: 'Boxheimer',
      isAdmin: true,
      password: await sails.helpers.passwords.hashPassword('admin'),
      address: adminAddress.id  // Referenz auf die neu erstellte Adresse
    });

    // Normaler User erstellen und mit der Adresse verknüpfen
    await User.create({
      emailAddress: 'user@example.com',
      firstName: 'Yasin',
      lastName: 'Oyman',
      isAdmin: false,
      password: await sails.helpers.passwords.hashPassword('user'),
      address: normalUserAddress.id  // Referenz auf die neu erstellte Adresse
    });

  }

  // Create categories and ratings if they do not exist
  const categoryCount = await Category.count();
  if (categoryCount === 0) {
    await Category.createEach([
      { name: 'Fruchtig', type: 'Taste' },
      { name: 'Wuerzig', type: 'Taste' },
      { name: 'Suess', type: 'Taste' },
      { name: 'Blumig', type: 'Taste' },
      { name: 'Beruhigend', type: 'Effect' },
      { name: 'Anregend', type: 'Effect' },
      { name: 'Staerkend', type: 'Effect' }
    ]);
    sails.log.info('Default categories created!');
  } else {
    sails.log.info('Categories already exist.');
  }

  const ratingsCount = await Rating.count();
  if (ratingsCount === 0) {
    await Rating.createEach([
      { stars: 1 },
      { stars: 2 },
      { stars: 3 },
      { stars: 4 },
      { stars: 5 }
    ]);
    sails.log.info('Default ratings created!');
  } else {
    sails.log.info('Ratings already exist.');
  }

  // Create products if none exist
  const productCount = await Product.count();
  if (productCount === 0) {
    const categories = await Category.find();
    const allRatings = await Rating.find();
    const images = [
      'blackTea.jpg',
      'fruitTea.jpg',
      'greenTea.jpg',
      'herbalTea.jpg',
      'jasmineTea.jpg',
      'kraeutertee.jpg',
      'schwarztee.jpg',
      'whiteTea.jpg',
    ];

    // Random Artikel Namen und Beschreibungen
    const teaNamesDescriptions = [
      {
        name: 'Himalayan White Tea',
        description: 'Dieser seltene und hochgeschätzte Tee stammt aus den unberührten Höhen des Himalayas. Sein Geschmack ist außergewöhnlich sanft und zart, mit subtilen floralen Noten, die an blühende Wildblumen erinnern, und einem Hauch von saftigen, reifen Früchten. Perfekt für diejenigen, die eine raffinierte und entspannende Tasse Tee suchen.'
      },
      {
        name: 'Russian Caravan',
        description: 'Ein Tee, der eine faszinierende Geschichte erzählt: Der Russian Caravan ist inspiriert von den Handelsrouten zwischen China und Russland, bei denen Tees mit dem Duft von Lagerfeuern durchdrungen wurden. Mit seinem rauchigen, kräftigen und dennoch harmonischen Geschmack ist dieser Tee ideal für Abende vor dem Kamin oder als Begleiter zu herzhaften Speisen.'
      },
      {
        name: 'English Breakfast',
        description: 'Ein zeitloser Klassiker unter den Tees, der für seine kräftige und vollmundige Mischung geschätzt wird. Perfekt für den Start in den Tag, vereint der English Breakfast die besten schwarzen Teesorten, die mit Milch oder Zitrone gleichermaßen hervorragend schmecken. Ein wahrer Genuss für Liebhaber traditioneller Tees.'
      },
      {
        name: 'Sencha Green Tea',
        description: 'Sencha ist der Stolz Japans und bietet ein erfrischendes, lebendiges Geschmackserlebnis. Mit seinen grasigen, leicht süßen Noten und einer angenehmen Umami-Tiefe ist dieser grüne Tee sowohl ein Genuss für den Gaumen als auch eine Quelle für Ruhe und Achtsamkeit. Ideal für Teekenner, die den puren Geschmack von grünem Tee suchen.'
      },
      {
        name: 'Pu-Erh Vintage',
        description: 'Ein einzigartiger Tee mit einem tiefen, erdigen Geschmack, der durch sorgfältiges Altern noch komplexer wird. Pu-Erh Tee wird traditionell für seine beruhigende Wirkung und seinen reichhaltigen, robusten Charakter geschätzt. Dieser Tee eignet sich hervorragend für entspannende Momente und reflektierende Gedanken.'
      },
      {
        name: 'Lapsang Souchong',
        description: 'Für Liebhaber außergewöhnlicher Tees ist Lapsang Souchong eine wahre Offenbarung. Diese Sorte wird über Kiefernholz geräuchert und bietet ein intensives, rauchiges Aroma, das perfekt zu herzhaften Gerichten oder als aufregender Alleingang passt. Ein Tee mit einem unvergesslichen Charakter.'
      },
      {
        name: 'Rooibos Vanilla',
        description: 'Ein wunderbar koffeinfreier Tee aus Südafrika, der durch die Zugabe von Vanille eine besonders weiche, cremige Süße erhält. Rooibos Vanilla ist die ideale Wahl für Momente der Entspannung und als Begleitung zu Desserts oder für gemütliche Abende auf der Couch.'
      },
      {
        name: 'Ceylon Orange Pekoe',
        description: 'Ein lebendiger Schwarztee aus den Hügeln Sri Lankas, der für seine spritzigen Zitrusnoten und seinen klaren Geschmack bekannt ist. Dieser Tee wird oft pur genossen, ist aber auch eine wunderbare Basis für Eistee oder raffinierte Teemischungen. Erfrischend und belebend in jeder Tasse.'
      },
      {
        name: 'Genmaicha',
        description: 'Ein traditioneller japanischer Tee, der grünen Tee mit geröstetem Reis kombiniert. Der nussige, leicht süße Geschmack von Genmaicha erinnert an Komfort und Einfachheit und ist eine wunderbare Wahl für ruhige Nachmittage oder als Begleitung zu leichten Gerichten.'
      },
      {
        name: 'Chai Masala',
        description: 'Ein würziger schwarzer Tee, der die Seele Indiens in sich trägt. Mit einer Mischung aus Kardamom, Zimt, Ingwer und anderen Gewürzen ist Chai Masala ein sinnlicher und wärmender Genuss, der mit oder ohne Milch serviert werden kann. Perfekt für kalte Tage oder als Nachmittags-Highlight.'
      },
      {
        name: 'Gunpowder Green Tea',
        description: 'Dieser grüne Tee, der seinen Namen von den kleinen, fest gerollten Blättern hat, entfaltet beim Aufbrühen einen klaren, kräftigen Geschmack. Gunpowder Green Tea ist erfrischend und energiegeladen, ideal für Teetrinker, die einen intensiveren grünen Tee suchen.'
      },
      {
        name: 'Minty Rooibos',
        description: 'Eine erfrischende Kombination aus südafrikanischem Rooibos und kühler Minze. Diese Mischung ist ideal für heiße Sommerabende, da sie sowohl heiß als auch gekühlt genossen werden kann. Der minzige Geschmack sorgt für eine belebende Frische, während der Rooibos beruhigt.'
      },
      {
        name: 'Honeybush Tea',
        description: 'Ähnlich wie Rooibos ist Honeybush ein koffeinfreier Tee mit einer natürlichen, süßen Note, die an Honig und Blumen erinnert. Dieser sanfte Tee ist ideal für entspannte Abende und ein wunderbarer Begleiter für süße oder fruchtige Desserts.'
      },
      {
        name: 'Yerba Mate',
        description: 'Ein südamerikanisches Kultgetränk, das für seinen hohen Koffeingehalt und seine belebende Wirkung bekannt ist. Yerba Mate bietet einen herben, grasigen Geschmack und ist die perfekte Wahl für alle, die einen Energieschub suchen, ohne auf natürlichen Geschmack zu verzichten.'
      },
      {
        name: 'Hibiscus Bliss',
        description: 'Dieser Tee verzaubert mit seiner tiefroten Farbe und seinem fruchtig-säuerlichen Geschmack. Hibiscus Bliss ist erfrischend und belebend, perfekt für heiße Sommertage oder als Basis für einen selbstgemachten Eistee. Ein Fruchtgenuss, der die Sinne weckt.'
      }
    ];

    for (let teaInfo of teaNamesDescriptions) {
      let price = (Math.random() * (15 - 3) + 3).toFixed(2);
      let reviews = Math.floor(Math.random() * 500);
      let imageIndex = Math.floor(Math.random() * images.length);

      let newProduct = await Product.create({
        name: teaInfo.name,
        image: `../../src/assets/images/${images[imageIndex]}`,
        price: price,
        quantity: 100,
        description: teaInfo.description,
        reviews: reviews,
      }).fetch();

      // Mehrere ProductRating Einträge erstellen
      const numberOfRatings = Math.floor(Math.random() * 5) + 1; // 1 bis 5 Bewertungen pro Produkt
      const productRatings = Array.from({ length: numberOfRatings }).map(() => {
        const selectedRatingId = allRatings[Math.floor(Math.random() * allRatings.length)].id;
        return {
          product: newProduct.id,
          rating: selectedRatingId
        };
      });
      await ProductRating.createEach(productRatings);

      // Wähle zufällig eine oder mehrere Kategorien aus, ohne Duplikate
      const numberOfCategories = Math.floor(Math.random() * 3) + 1; // 1 bis 3 Kategorien pro Produkt
      const selectedCategories = categories
        .sort(() => 0.5 - Math.random()) // Zufällige Sortierung
        .slice(0, numberOfCategories); // Auswahl der ersten n Kategorien

      const productCategories = selectedCategories.map(cat => ({
        product: newProduct.id,
        category: cat.id
      }));
      await ProductCategory.createEach(productCategories);
    }

    sails.log.info(`${teaNamesDescriptions.length} new tea products created!`);
  } else {
    sails.log.info('Tea items already exist.');
  }
};
