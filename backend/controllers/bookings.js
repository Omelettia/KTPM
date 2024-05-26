const router = require('express').Router()

const { User, Equipment, Booking, BookingEquipments } = require('../models')
const { tokenExtractor } = require('../util/middleware')

router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      attributes: { exclude: ['userId'] },
      include: [
        {
          model: Equipment,
          attributes: ['id'],
          through: {
            attributes: []
          }
        },
        {
          model: User,
          attributes: ['name']
        },
      ]
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);

    // Calculate total price based on equipment prices and duration
    let totalPrice = 0;
    for (const equipmentId of req.body.equipmentIds) {
      const equipment = await Equipment.findByPk(equipmentId);
      totalPrice += equipment.rentingPrice * req.body.duration;
    }

    // Create the booking with the calculated total price
    const booking = await Booking.create({
      ...req.body,
      userId: user.id,
      totalPrice: totalPrice, // Save the calculated total price
    });

    // If request body contains equipmentIds array, associate equipments with booking
    if (req.body.equipmentIds && req.body.equipmentIds.length > 0) {
      await booking.addEquipments(req.body.equipmentIds);
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Invalid data' });
  }
});

const bookingFinder = async (req, res, next) => {
  try {
    req.booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Equipment,
          attributes: ['id'],
          through: {
            attributes: []
          }
        },
        {
          model: User,
          attributes: ['name']
        },
      ]
    });
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

router.get('/:id', bookingFinder, async (req, res) => {
  if (req.booking) {
    res.json(req.booking);
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

router.delete('/:id', bookingFinder, async (req, res) => {
  if (req.booking) {
    await req.booking.destroy();
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

module.exports = router;
