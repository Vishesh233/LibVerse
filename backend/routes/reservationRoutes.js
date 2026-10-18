const express = require('express');
const {
  createReservation,
  getMyReservations,
  getReservations,
  getReservationQueues,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, isStaff, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Student routes
router.post('/', protect, isStudent, createReservation);
router.get('/me', protect, isStudent, getMyReservations);

// Staff routes
router.get('/', protect, isStaff, getReservations);
router.get('/queues', protect, isStaff, getReservationQueues);

// Owner or staff (checked in the controller)
router.delete('/:id', protect, cancelReservation);

module.exports = router;
