const { Router } = require('express');
const classController = require('../controllers/class.controller');
const { validateBody, validateQuery, requireId } = require('../middlewares/validate');
const { classSchema, listQuerySchema } = require('../validators/class.validator');

const router = Router();

router.get('/', validateQuery(listQuerySchema), classController.list);
router.post('/', validateBody(classSchema), classController.create);
router.get('/:classId', classController.getById);
router.put('/:classId', requireId('classId'), validateBody(classSchema), classController.update);
router.patch('/:classId', requireId('classId'), validateBody(classSchema, { partial: true }), classController.update);
router.delete('/:classId', classController.remove);

module.exports = router;
