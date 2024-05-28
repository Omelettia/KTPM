const router = require('express').Router();
const { tokenExtractor,isStaff } = require('../util/middleware');
const { User, EquipmentType, Equipment } = require('../models');
router.get('/', async (req, res) => {
  try {
    const equipments = await Equipment.findAll({
      attributes: { exclude: ['userId'] },
      include: [
        {
          model: User,
          attributes: ['name']
        },
        {
          model: EquipmentType,
          attributes: ['name', 'category', 'renting_price','equipment_image']
        }
      ]
    });
    res.json(equipments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch all equipment related to an equipment type by ID
router.get('/:equipmentTypeId/equipments', async (req, res) => {
  try {
    // Find the equipment type by ID
    const equipmentTypeId = req.params.equipmentTypeId;

    // Find all equipments with the matching equipment_type_id
    const equipments = await Equipment.findAll({
      where: {
        equipment_type_id: equipmentTypeId
      },
      include: [
        {
          model: User,
          attributes: ['name']
        },
        {
          model: EquipmentType,
          attributes: ['name', 'category', 'rentingPrice']
        }
      ]
    });

    // If no equipment is found, return a 404 status code with an empty response
    if (!equipments || equipments.length === 0) {
      return res.status(404).json({ error: 'No equipments found for the specified equipment type ID' });
    }

    // Return the list of equipments related to the equipment type
    res.json(equipments);
  } catch (error) {
    // If an error occurs, return a 500 status code with an error message
    console.error('Error fetching equipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', tokenExtractor,isStaff, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);

    const equipmentType = await EquipmentType.findByPk(req.body.equipmentTypeId);
    if (!equipmentType) {
      return res.status(400).json({ error: 'Invalid equipment type' });
    }

    const equipment = await Equipment.create({
      ...req.body,
      equipmentTypeId: equipmentType.id
    });
    res.json(equipment);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Invalid data' });
  }
});

const equipmentFinder = async (req, res, next) => {
  try {
    req.equipment = await Equipment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name']
        },
        {
          model: EquipmentType,
          attributes: ['name', 'category', 'rentingPrice']
        }
      ]
    });
    if (!req.equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

router.get('/:id', equipmentFinder, async (req, res) => {
  res.json(req.equipment);
});

router.delete('/:id', tokenExtractor, equipmentFinder,isStaff, async (req, res) => {
  try {
    await req.equipment.destroy();
    res.status(204).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
