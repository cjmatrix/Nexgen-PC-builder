import * as componentService from "../services/componentService.js";
import Component from "../models/Component.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const createComponent = async (req, res) => {
  const component = await componentService.createComponent(req.body);
  res.status(HTTP_STATUS.CREATED).json({ success: true, data: component });
};

const getAdminComponents = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { search, category, status, sort } = req.query;

  const result = await componentService.getAdminComponents(
    page,
    limit,
    search,
    category,
    status,
    sort,
  );

  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

const deleteComponent = async (req, res) => {
  const result = await componentService.deleteComponent(req.params.id);

  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};

const getComponentById = async (req, res) => {
  const component = await componentService.getComponentById(req.params.id);
  res.status(HTTP_STATUS.OK).json({ success: true, data: component });
};

const updateComponent = async (req, res) => {
  const component = await componentService.updateComponent(
    req.params.id,
    req.body,
  );
  res.status(HTTP_STATUS.OK).json({ success: true, data: component });
};

const getComponents = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { sort, category, search, ...otherParams } = req.query;

  const filters = {
    category,
    search,
    ...otherParams,
  };

  if (req.query.cpuId) {
    const cpu = await Component.findById(req.query.cpuId);
    if (cpu) {
      filters.socket = cpu.specs.socket;

      filters.maxTier = cpu.tier_level + 1;
    }
  }

  if (req.query.motherboardId) {
    const mobo = await Component.findById(req.query.motherboardId);
    if (mobo) {
      filters.ramType = mobo.specs.ramType;
      filters.formFactor = mobo.specs.formFactor;
    }
  }

  if (req.query.gpuId) {
    const gpu = await Component.findById(req.query.gpuId);
    if (gpu) {
      filters.minGpuLength = gpu.specs.length_mm;
    }
  }

  if (req.query.caseId) {
    const pcCase = await Component.findById(req.query.caseId);
    if (pcCase) {
      filters.maxGpuLength = pcCase.specs.maxGpuLength_mm;
    }
  }

  const result = await componentService.getPublicComponents(
    filters,
    page,
    limit,
    sort,
  );

  res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

export {
  createComponent,
  getAdminComponents,
  deleteComponent,
  getComponentById,
  updateComponent,
  getComponents,
};
