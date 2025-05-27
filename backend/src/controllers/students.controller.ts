import { prisma } from "../config/db";
import { registerStudent } from "../schemas/schema";
import type { Request, Response } from "express";

export const create = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parsedBody = registerStudent.safeParse(body);
    if (!parsedBody.success) {
      res.status(400).json({
        error: "Invalid registration data",
        message: parsedBody.error.errors.map((error) => error.message),
      });
      return;
    }

    const { marks, ...studentData } = parsedBody.data;
    const existingUser = await prisma.student.findUnique({
      where: { email: studentData.email },
    });
    if (existingUser) {
      res.status(409).json({
        error: "User already exists",
        details: "Email is already registered",
      });
      return;
    }
    const marksData = (marks ?? []).map((mark) => ({
      subject: mark.subject,
      score: Math.round(mark.score * 100),
    }));

    const student = await prisma.student.create({
      data: {
        ...studentData,
        marks: {
          create: marksData,
        },
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        student: studentData,
        marks: marksData,
      },
    });
    return;
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "Registration failed",
        details: error.message,
      });
      return;
    }
    res.status(500).json({
      error: "Registration failed",
      details: "An unexpected error occurred",
    });
    return;
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany();
    if (students.length === 0) {
      res.status(404).json({ message: "No students found" });
      return;
    }
    res.status(200).json({
      status: "success",
      data: students,
    });
    return;
  } catch (error) {
    console.error("Error retrieving students:", error);
    res.status(500).json({ message: "Failed to retrieve students" });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    res.status(200).json({
      status: "success",
      data: student,
    });
    return;
  } catch (error) {
    console.error("Error retrieving student:", error);
    res.status(500).json({ message: "Failed to retrieve student" });
  }
};

export const deleteById = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    await prisma.student.delete({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Failed to delete student" });
  }
};
