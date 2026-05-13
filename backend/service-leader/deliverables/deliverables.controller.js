import prisma from '../../core/config/db.js';
import { notifyOnDeliverableUploaded } from '../../admin/settings/settings.service.js';

export const getAssignedRequests = async (req, res) => {
  try {
    const leaderProfile = await prisma.serviceLeaderProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!leaderProfile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const assignments = await prisma.assignment.findMany({
      where: { leaderId: leaderProfile.id },
      include: {
        request: {
          include: {
            service: true,
            client: { include: { user: true } },
          },
        },
      },
    });

    const requests = assignments.map(a => ({
      requestId: a.request.id,
      requestNumber: a.request.requestNumber,
      requestTitle: a.request.title,
      serviceName: a.request.service.name,
      clientName: a.request.client.user.fullName,
      status: a.request.status,
      dueDate: a.request.dueDate,
    }));

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const createDeliverable = async (req, res) => {
  try {
    const { requestId, title, description, fileUrl } = req.body;

    const leaderProfile = await prisma.serviceLeaderProfile.findUnique({
      where: { userId: req.user.id },
    });

    const assignment = await prisma.assignment.findFirst({
      where: { requestId, leaderId: leaderProfile.id },
    });

    if (!assignment) return res.status(403).json({ success: false, message: 'Not authorized for this request' });

    const deliverable = await prisma.deliverable.create({
      data: {
        requestId,
        title,
        description,
        fileUrl,
        status: 'PENDING',
      },
    });

    try {
      await notifyOnDeliverableUploaded(requestId);
    } catch (error) {
      console.error('Deliverable notification failed', error.message);
    }

    res.status(201).json({ success: true, message: 'Deliverable created successfully', data: deliverable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getDeliverables = async (req, res) => {
  try {
    const { requestId } = req.query;

    const leaderProfile = await prisma.serviceLeaderProfile.findUnique({
      where: { userId: req.user.id },
    });

    const whereClause = {
      request: {
        assignment: { leaderId: leaderProfile.id }
      }
    };
    if (requestId) whereClause.requestId = requestId;

    const deliverables = await prisma.deliverable.findMany({
      where: whereClause,
      include: {
        request: {
          include: {
            service: true,
            client: { include: { user: true } },
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
    });

    const data = deliverables.map(d => ({
      id: d.id,
      requestNumber: d.request.requestNumber,
      serviceName: d.request.service.name,
      clientName: d.request.client.user.fullName,
      title: d.title,
      description: d.description,
      fileUrl: d.fileUrl,
      status: d.status,
      adminNote: d.adminNote,
      submittedAt: d.submittedAt,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getDeliverableById = async (req, res) => {
  try {
    const { id } = req.params;
    const deliverable = await prisma.deliverable.findUnique({
      where: { id },
      include: { request: { include: { assignment: true } } }
    });

    const leaderProfile = await prisma.serviceLeaderProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!deliverable || deliverable.request.assignment.leaderId !== leaderProfile.id) {
      return res.status(404).json({ success: false, message: 'Deliverable not found' });
    }

    res.json({ success: true, data: deliverable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const resubmitDeliverable = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl } = req.body;

    const deliverable = await prisma.deliverable.findUnique({
      where: { id },
      include: { request: { include: { assignment: true } } }
    });

    const leaderProfile = await prisma.serviceLeaderProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!deliverable || deliverable.request.assignment.leaderId !== leaderProfile.id || deliverable.status !== 'REJECTED') {
      return res.status(400).json({ success: false, message: 'Cannot resubmit this deliverable' });
    }

    const updated = await prisma.deliverable.update({
      where: { id },
      data: {
        title: title ?? deliverable.title,
        description: description ?? deliverable.description,
        fileUrl: fileUrl ?? deliverable.fileUrl,
        status: 'PENDING',
      },
    });

    res.json({ success: true, message: 'Resubmitted successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};