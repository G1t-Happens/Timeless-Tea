module.exports.bootstrap = async function() {
  sails.log.info('Bootstrapping application...');

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
      { name: 'Darjeeling Black Tea', description: 'Ein muskateller Tee mit einem zarten und floralen Aroma.' },
      { name: 'Assam Bold Black', description: 'Kräftig und malzig, ideal für ein starkes englisches Frühstück.' },
      { name: 'Chinese Oolong', description: 'Teilweise oxidiert mit einem ausgewogenen Geschmack zwischen schwarz und grün.' },
      { name: 'Jasmine Green Tea', description: 'Grüner Tee duftend gemacht mit Jasminblüten für ein sanftes Aroma.' },
      { name: 'Moroccan Mint Tea', description: 'Erfrischend und belebend, eine perfekte Wahl nach dem Essen.' },
      { name: 'Chamomile Herbal', description: 'Beruhigend und entspannend, ideal vor dem Schlafengehen.' },
      { name: 'Lemon Ginger Herbal', description: 'Scharf und belebend, perfekt für eine Erkältung oder Grippe.' },
      { name: 'Earl Grey', description: 'Schwarzer Tee mit einem Hauch von Bergamotte für eine zitrusartige Note.' },
      { name: 'Matcha Green Tea', description: 'Pulverisierter grüner Tee reich an Antioxidantien und voller Geschmack.' },
      { name: 'Silver Needle White Tea', description: 'Weißer Tee mit einer süßen, leicht nussigen Note.' }
    ];

    for (let teaInfo of teaNamesDescriptions) {
      let price = (Math.random() * 20 + 5).toFixed(2);
      let reviews = Math.floor(Math.random() * 500);
      let selectedRatingId = allRatings[Math.floor(Math.random() * allRatings.length)].id;
      let categoryId = categories[Math.floor(Math.random() * categories.length)].id;
      let imageIndex = Math.floor(Math.random() * images.length);

      let newProduct = await Product.create({
        name: teaInfo.name,
        image: `../../src/assets/images/${images[imageIndex]}`,
        price: price,
        description: teaInfo.description,
        reviews: reviews,
      }).fetch();

      // Create a ProductRating entry
      await ProductRating.create({
        product: newProduct.id,
        rating: selectedRatingId
      });

      // Create a ProductCategory entry
      await ProductCategory.create({
        product: newProduct.id,
        category: categoryId
      });

    }
    sails.log.info(`${teaNamesDescriptions.length} new tea products created!`);
  } else {
    sails.log.info('Tea items already exist.');
  }
};
