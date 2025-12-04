const componentService = require("../services/componentService");

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
    console.log(status);
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
    console.log(result);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createComponent, getAdminComponents, deleteComponent };
