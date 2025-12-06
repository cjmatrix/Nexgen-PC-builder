const componentService = require("../services/componentService");
const Component =require("../models/Component")
const createComponent = async (req, res) => {
  try {
    const component = await componentService.createComponent(req.body);
    res.status(201).json({ success: true, data: component });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminComponents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { search, category, status, sort } = req.query;

    const result = await componentService.getAdminComponents(
      page,
      limit,
      search,
      category,
      status,
      sort
    );

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComponent = async (req, res) => {
  try {
    const result = await componentService.deleteComponent(req.params.id);
 
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComponentById = async (req, res) => {
  try {
    const component = await componentService.getComponentById(req.params.id);
    res.status(200).json({ success: true, data: component });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateComponent = async (req, res) => {
  try {
    const component = await componentService.updateComponent(
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, data: component });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getComponents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { sort, category, search, ...otherParams } = req.query;
    
    // Initialize filters with basic params
    const filters = {
      category,
      search,
      ...otherParams
    };

    // --- LOGIC: Translate IDs into Specs ---

    // 1. If CPU is selected -> Filter Motherboards, Coolers, GPUs
    if (req.query.cpuId) {
      const cpu = await Component.findById(req.query.cpuId);
      if (cpu) {
        filters.socket = cpu.specs.socket; // Mobo/Cooler must match this
        
        // FIXED: Calculate maxTier here and match the variable name used in Service
        filters.maxTier = cpu.tier_level + 1; 
      }
    }

    // 2. If Motherboard is selected -> Filter RAM, Case
    if (req.query.motherboardId) {
      const mobo = await Component.findById(req.query.motherboardId);
      if (mobo) {
        filters.ramType = mobo.specs.ramType; // RAM must match DDR4/DDR5
        filters.formFactor = mobo.specs.formFactor; // Case must fit ATX/mATX
      }
    }

    // 3. If GPU is selected -> Filter Case (Length)
    if (req.query.gpuId) {
      const gpu = await Component.findById(req.query.gpuId);
      if (gpu) {
        filters.minGpuLength = gpu.specs.length_mm; // Case must be bigger than this
      }
    }

    // 4. If Case is selected -> Filter GPU (Length)
    if (req.query.caseId) {
      const pcCase = await Component.findById(req.query.caseId);
      if (pcCase) {
        filters.maxGpuLength = pcCase.specs.maxGpuLength_mm; // GPU must be smaller than this
      }
    }

    const result = await componentService.getPublicComponents(filters, page, limit, sort);
    console.log(`${category?`${category}`:`emptyy`}------------------------------\n-----------------------------\n`)
    console.log(result)
    
    res.status(200).json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  createComponent,
  getAdminComponents,
  deleteComponent,
  getComponentById,
  updateComponent,
  getComponents
};
