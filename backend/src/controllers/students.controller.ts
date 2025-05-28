import { prisma } from "../config/db";
import {
  paginationQuerySchema,
  registerStudent,
  updateStudent,
} from "../schemas/schema";
import type { Request, Response } from "express";
export const create = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parsedBody = registerStudent.safeParse(body);
    if (!parsedBody.success) {
      res.status(400).json({
        error: "Invalid registration data",
        message: parsedBody.error.errors.map(
          (err) => `${err.path[0]} ${err.message}`
        ),
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
      include: {
        marks: true,
      },
    });
    student.marks = student.marks.map((mark) => ({
      ...mark,
      score: mark.score / 100,
    }));
    res.status(201).json({
      status: "success",
      data: student,
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

export const update = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parsedBody = updateStudent.safeParse(body);
    if (!parsedBody.success) {
      res.status(400).json({
        error: "Invalid registration data",
        message: parsedBody.error.errors.map(
          (err) => `${err.path[0]} ${err.message}`
        ),
      });
      return;
    }

    const { marks, ...studentData } = parsedBody.data;
    const user = await prisma.student.findUnique({
      where: { id: req.params.id },
    });
    if (!user) {
      res.status(404).json({
        error: "User not found",
        details: "Email is not registered",
      });
      return;
    }
    if (studentData.email && studentData.email !== user.email) {
      res.status(400).json({
        error: "Email cannot be updated",
        details: "Email is already registered and cannot be changed",
      });
      return;
    }
    const updatedStudent = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        ...studentData,
        marks: marks
          ? {
              deleteMany: {},
              create: marks.map((mark) => ({
                subject: mark.subject,
                score: Math.round(mark.score * 100),
              })),
            }
          : undefined,
      },
      include: {
        marks: true,
      },
    });
    updatedStudent.marks = updatedStudent.marks.map((mark) => ({
      ...mark,
      score: mark.score / 100,
    }));
    res.status(200).json({
      status: "success",
      data: updatedStudent,
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
    const parsed = paginationQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        message: parsed.error.errors.map(
          (err) => `${err.path[0]} ${err.message}`
        ),
      });
      return;
    }
    const page = parsed.data.page ? parseInt(parsed.data.page) : null;
    const limit = parsed.data.limit ? parseInt(parsed.data.limit) : null;

    const findOptions: {
      include: { marks: boolean };
      skip?: number;
      take?: number;
    } = {
      include: { marks: true },
    };

    if (page && limit) {
      findOptions.skip = (page - 1) * limit;
      findOptions.take = limit;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany(findOptions),
      prisma.student.count(),
    ]);

    if (students.length === 0) {
      res.status(404).json({ message: "No students found" });
      return;
    }
    students.map((student) => {
      student.marks = student.marks.map((mark) => ({
        ...mark,
        score: mark.score / 100,
      }));
    });
    res.status(200).json({
      status: "success",
      data: students,
      meta: {
        page,
        limit,
        total,
      },
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
      include: {
        marks: true,
      },
    });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    student.marks = student.marks.map((mark) => ({
      ...mark,
      score: mark.score / 100,
    }));

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
