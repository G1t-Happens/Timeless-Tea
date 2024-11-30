/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async function() {

  sails.log.info('Bootstrapping application...');

  // Überprüfe, ob bereits Kategorien vorhanden sind
  const categoryCount = await Category.count();
  const ratings = await Rating.count();

  if (categoryCount === 0) {
    // Füge Standard-Kategorien hinzu, wenn keine vorhanden sind
    await Category.createEach([
      { name: 'Tee' },
      { name: 'Kaffee' },
      { name: 'Kräuter' }
    ]);
    sails.log.info('Default categories created!');
  } else {
    sails.log.info('Categories already exist.');
  }

  if (ratings === 0) {
    // Füge Ratings hinzu, wenn keine vorhanden sind
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

};
