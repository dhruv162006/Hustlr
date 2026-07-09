import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import logger from "../utils/logger";
import { ReportStatus } from "@prisma/client";

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentsCount = await prisma.user.count({ where: { role: "STUDENT" } });
    const foundersCount = await prisma.user.count({ where: { role: "FOUNDER" } });
    const recruitersCount = await prisma.user.count({ where: { role: "RECRUITER" } });
    
    const activeGigsCount = await prisma.opportunity.count();
    const reportsCount = await prisma.report.count({ where: { status: "PENDING" } });
    
    // Verifications pending (users with isVerified = false but profile exists)
    const verificationsPendingCount = await prisma.user.count({
      where: { isVerified: false },
    });

    return res.json({
      students: studentsCount,
      founders: foundersCount,
      recruiters: recruitersCount,
      activeGigs: activeGigsCount,
      pendingReports: reportsCount,
      pendingVerifications: verificationsPendingCount,
      volumeGMV: "₹12.4 Lakhs",
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: { name: true, email: true },
        },
        reportedUser: {
          select: { name: true, email: true },
        },
        reportedOpportunity: {
          select: { title: true, clientName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedReports = reports.map((r) => ({
      id: r.id,
      reporter: r.reporter.name,
      reportedTarget: r.reportedUser?.name || r.reportedOpportunity?.title || "Platform Content",
      reason: r.reason,
      status: r.status,
      date: r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }));

    return res.json(formattedReports);
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // RESOLVED or DISMISSED

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        status: status.toUpperCase() as ReportStatus,
      },
    });

    return res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getVerificationRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { isVerified: false },
      include: { profile: true },
    });

    const requests = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      university: u.profile?.university || "Not provided",
      gradYear: u.profile?.gradYear || "N/A",
      submittedAt: u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

    return res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const approveVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });

    logger.info(`Admin approved verification for user: ${user.email}`);
    return res.json({ message: "User profile successfully verified", user });
  } catch (error) {
    next(error);
  }
};
