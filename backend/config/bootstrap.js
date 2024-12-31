module.exports.bootstrap = async function() {
  sails.log.info('Bootstrapping application...');

  // Create SuperAdmin User if not exist
  const userCount = await User.count();
  if (userCount === 0) {
    await User.createEach([
      { emailAddress: 'admin@example.com', firstName: 'Daniel', lastName: 'Boxheimer', isAdmin: true, password: await
      sails.helpers.passwords.hashPassword('admin') },
    ]);
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
      'greenTea.jpg',
      'herbalTea.jpg'
    ];

    //Random Artikel Namen und Beschreibungen
    const teaNamesDescriptions = [
      { name: 'Himalayan White Tea', description: 'Sanft und delikat mit einem Hauch von süßen Blumen und Früchten.' },
      { name: 'Russian Caravan', description: 'Rauchig und kräftig, inspiriert von alten Handelsrouten.' },
      { name: 'English Breakfast', description: 'Ein klassischer Blend aus schwarzen Tees, kräftig und vollmundig.' },
      { name: 'Sencha Green Tea', description: 'Ein japanischer Klassiker mit einem grasigen, leicht süßen Geschmack.' },
      { name: 'Pu-Erh Vintage', description: 'Ein gereifter Tee mit erdigen, komplexen Aromen.' },
      { name: 'Lapsang Souchong', description: 'Einzigartig rauchig durch das Trocknen über Kiefernholzfeuer.' },
      { name: 'Rooibos Vanilla', description: 'Süß und cremig mit der Wärme von Vanille.' },
      { name: 'Ceylon Orange Pekoe', description: 'Lebendig und spritzig mit einer leichten Zitrusnote.' },
      { name: 'Genmaicha', description: 'Grüner Tee gemischt mit geröstetem Reis für einen nussigen Geschmack.' },
      { name: 'Chai Masala', description: 'Würziger schwarzer Tee mit Kardamom, Zimt und Gewürzen.' },
      { name: 'Gunpowder Green Tea', description: 'Grüner Tee in gerollten Kügelchen mit einem kräftigen und klaren Geschmack.' },
      { name: 'Minty Rooibos', description: 'Erfrischend und kräuterig, perfekt für heiße Sommerabende.' },
      { name: 'Honeybush Tea', description: 'Sanft süß mit einem Hauch von Honig und Blumen.' },
      { name: 'Yerba Mate', description: 'Belebend und herb mit grasigen Untertönen aus Südamerika.' },
      { name: 'Hibiscus Bliss', description: 'Fruchtig und sauer, leuchtend rot in der Tasse.' },
      { name: 'Peach Black Tea', description: 'Süß und fruchtig mit dem Aroma von reifen Pfirsichen.' },
      { name: 'Blueberry White Tea', description: 'Mild und süß, mit einem Hauch von fruchtiger Frische.' },
      { name: 'Lavender Earl Grey', description: 'Ein blumiger Twist auf dem Klassiker mit beruhigendem Lavendel.' },
      { name: 'Turmeric Ginger Tea', description: 'Würzig und gesund, perfekt für einen immunstärkenden Tee.' },
      { name: 'Wild Berry Herbal', description: 'Vollgepackt mit dem Geschmack von gemischten Beeren.' },
      { name: 'Pineapple Coconut Green', description: 'Tropisch und frisch, eine exotische Teemischung.' },
      { name: 'Cranberry Hibiscus', description: 'Fruchtig und belebend mit einer leichten Säure.' },
      { name: 'Vanilla Oolong', description: 'Sanft und cremig mit einem Hauch von süßer Vanille.' },
      { name: 'Apple Cinnamon Spice', description: 'Herbstlich und warm, wie ein frischer Apfelkuchen.' },
      { name: 'Rose Petal Black Tea', description: 'Elegant und floral mit dem Duft von Rosenblättern.' },
      { name: 'Mango Green Tea', description: 'Fruchtig und süß, ideal für einen erfrischenden Sommertee.' },
      { name: 'Lemon Balm Herbal', description: 'Zitronig und beruhigend, perfekt zur Entspannung.' },
      { name: 'Coconut Chai', description: 'Würzig und cremig mit einem exotischen Kokosaroma.' },
      { name: 'Elderflower Herbal', description: 'Leicht süß und floral, ideal für Frühlingsmomente.' },
      { name: 'Persian Rose Tea', description: 'Exotisch und blumig mit einem Hauch von orientalischem Charme.' },
      { name: 'Spiced Orange Black Tea', description: 'Kräftig mit Noten von Orange, Zimt und Gewürzen.' },
      { name: 'Mint Chocolate Rooibos', description: 'Kräuterig mit einer süßen Note von Schokolade und Minze.' },
      { name: 'Apricot Oolong', description: 'Fruchtig und samtig mit dem Geschmack von Aprikosen.' },
      { name: 'Cucumber Melon White', description: 'Erfrischend und leicht, ideal für warme Tage.' },
      { name: 'Cassis Black Tea', description: 'Fruchtig und dunkel mit einem Hauch von schwarzer Johannisbeere.' },
      { name: 'Spicy Ginger Citrus', description: 'Scharf und spritzig, perfekt für ein wärmendes Getränk.' },
      { name: 'Berry Green Fusion', description: 'Eine Mischung aus Beeren und grünem Tee für einen frischen Geschmack.' },
      { name: 'Caramel Rooibos', description: 'Süß und samtig mit einem Hauch von Karamell.' }
    ];

    for (let teaInfo of teaNamesDescriptions) {
      let price = (Math.random() * 20 + 5).toFixed(2);
      let reviews = Math.floor(Math.random() * 500);
      let imageIndex = Math.floor(Math.random() * images.length);

      let newProduct = await Product.create({
        name: teaInfo.name,
        image: `../../src/assets/images/${images[imageIndex]}`,
        price: price,
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
