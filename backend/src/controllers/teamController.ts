import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { sendNotification } from "../services/notificationService";
import logger from "../utils/logger";
import { ProjectStatus, TaskStatus } from "@prisma/client";

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = req.user?.userId;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          description,
          leadId,
          status: "RECRUITING",
        },
      });

      // Add leader as a member
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: leadId,
          role: "Lead",
        },
      });

      return newTeam;
    });

    logger.info(`Team created: ${team.name} (ID: ${team.id}) by user ${leadId}`);
    return res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = req.user?.userId;
    const { teamId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.leadId !== leadId) {
      return res.status(403).json({ error: "Only the team lead can invite members" });
    }

    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      return res.status(404).json({ error: "User with this email not found" });
    }

    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: "User is already a member of this team" });
    }

    // Send a team invite notification (accepting adds them to the team)
    await sendNotification(
      invitedUser.id,
      "TEAM_INVITE",
      "Team Invitation",
      `You have been invited to join the team: "${team.name}". Join via Team Hub.`
    );

    // Save temporary invitation state in notifications. Let's create a pending TeamMember status or check it.
    // For simplicity, we can create a TeamMember row with role "Invited" or handle it during acceptance.
    // Let's create it with role "Invited" so it shows up in Team Hub!
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId: invitedUser.id,
        role: "Invited",
      },
    });

    return res.json({ message: "Invitation sent successfully", member });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { teamId } = req.params;

    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!membership || membership.role !== "Invited") {
      return res.status(404).json({ error: "No invitation found for this team" });
    }

    await prisma.teamMember.update({
      where: { id: membership.id },
      data: { role: "Member" },
    });

    // Notify team lead
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (team) {
      await sendNotification(
        team.leadId,
        "TEAM_INVITE",
        "Invitation Accepted",
        `Someone accepted your invite and joined: "${team.name}"`
      );
    }

    return res.json({ message: "Invitation accepted" });
  } catch (error) {
    next(error);
  }
};

export const rejectInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { teamId } = req.params;

    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!membership || membership.role !== "Invited") {
      return res.status(404).json({ error: "No invitation found for this team" });
    }

    await prisma.teamMember.delete({ where: { id: membership.id } });

    return res.json({ message: "Invitation rejected" });
  } catch (error) {
    next(error);
  }
};

export const getTeamDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profile: {
                  select: {
                    avatarGradient: true,
                    headline: true,
                  },
                },
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    return res.json(team);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;
    const { title, description, dueDate, assigneeId } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const task = await prisma.task.create({
      data: {
        teamId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        status: "TODO",
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: status.toUpperCase().replace(/ /g, "_") as TaskStatus,
      },
    });

    return res.json(task);
  } catch (error) {
    next(error);
  }
};

export const getUserTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const teams = memberships.map((m) => ({
      id: m.team.id,
      name: m.team.name,
      description: m.team.description,
      status: m.team.status.toLowerCase().replace(/_/g, " "),
      role: m.role,
      membersCount: m.team.members.length,
      members: m.team.members.map((mem) => mem.user.name),
    }));

    return res.json(teams);
  } catch (error) {
    next(error);
  }
};
