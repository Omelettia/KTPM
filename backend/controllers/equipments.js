const router = require('express').Router();
const { sequelize } = require('../util/db');
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

router.put('/profile/:id',tokenExtractor,isStaff, async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const { state, user_id  } = req.body;
    equipment.state = state || equipment.state;
    equipment.user_id = user_id ;

    await equipment.save();
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

    const equipmentType = await EquipmentType.findByPk(req.body.equipmentTypeId);
    if (!equipmentType) {
      return res.status(400).json({ error: 'Invalid equipment type' });
    }

    const equipment = await Equipment.create({
      ...req.body,
      equipment_type_id: req.body.equipmentTypeId
    });
    res.json(equipment);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Invalid data' });
  }
});


router.put('/updateUserId', tokenExtractor, async (req, res) => {
  try {
    const { equipmentTypeId, userId } = req.body;
    // Find the first available equipment of the given type
    const availableEquipment = await Equipment.findOne({
      where: {
        equipment_type_id: equipmentTypeId,
        user_id: null // Available equipment has null userId
      }
    });

    // If no available equipment is found, return a 404 status code with an error message
    if (!availableEquipment) {
      return res.status(404).json({ error: 'No available equipment found for the specified equipment type' });
    }

    // Update the userId for the available equipment
    availableEquipment.user_id = userId;
    await availableEquipment.save();

    // Send back an object containing the rented back equipment ID and type ID
    const rentedBackEquipmentIds = {
      equipmentId: availableEquipment.id,
      equipmentTypeId: availableEquipment.equipment_type_id
    };

    res.json({ rentedBackEquipmentIds });
  } catch (error) {
    console.error('Error updating userId for available equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
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
          attributes: ['name', 'category', 'renting_price']
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

router.delete('/:id', tokenExtractor, equipmentFinder, isStaff, async (req, res) => {
  try {
    const equipment = req.equipment;

    // Check if the user_id is null
    if (equipment.user_id !== null) {
      return res.status(403).json({ error: 'Cannot delete equipment assigned to a user' });
    }

    // If the user_id is null, proceed with deletion
    await equipment.destroy();
    res.status(204).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// New endpoint to get the total number of equipments
router.get('/total/count', async (req, res) => {
  try {
    const count = await Equipment.count();
    res.json({ totalEquipments: count });
  } catch (error) {
    console.error('Error fetching equipment count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
