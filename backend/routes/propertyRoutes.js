// backend/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { isAgent, isAdmin } = require('../middleware/roleMiddleware');
const { handlePropertyImageUpload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/recent', propertyController.getRecentProperties);
router.get('/:id', propertyController.getPropertyById);

// Agent-specific routes - these should come before the dynamic /:id route
router.get('/agent/:id', propertyController.getPropertiesByAgentId);

// Route for getting current agent's properties
router.get('/agent/me', authenticateUser, isAgent, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get agent information
    const agentQuery = 'SELECT agent_id FROM agents WHERE user_id = $1';
    const agentResult = await require('../config/db').query(agentQuery, [userId]);
    
    if (agentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Agent profile not found' });
    }
    
    const agentId = agentResult.rows[0].agent_id;
    
    // Get properties for this agent
    const propertiesQuery = `
      SELECT p.*, 
             (SELECT image_path FROM property_images pi WHERE pi.property_id = p.property_id AND pi.is_thumbnail = true LIMIT 1) as thumbnail
      FROM properties p
      WHERE p.agent_id = $1
      ORDER BY p.created_at DESC
    `;
    
    const propertiesResult = await require('../config/db').query(propertiesQuery, [agentId]);
    
    res.status(200).json({
      properties: propertiesResult.rows,
      pagination: {
        total: propertiesResult.rows.length,
        page: 1,
        limit: propertiesResult.rows.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error getting agent properties:', error);
    res.status(500).json({ message: 'Error getting agent properties' });
  }
});

// Protected routes - requires authentication and agent role
router.post('/', authenticateUser, isAgent, handlePropertyImageUpload, propertyController.createProperty);
router.put('/:id', authenticateUser, isAgent, handlePropertyImageUpload, propertyController.updateProperty);
router.put('/:id/thumbnail', authenticateUser, isAgent, propertyController.updatePropertyThumbnail);
router.delete('/:id/images/:imageId', authenticateUser, isAgent, propertyController.deletePropertyImage);
router.delete('/:id', authenticateUser, isAgent, propertyController.deleteProperty);

module.exports = router;