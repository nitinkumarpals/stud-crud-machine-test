import { Router } from "express";
import { create, deleteById, getStudentById, getStudents, update } from "../controllers/students.controller";
const router = Router();
router.post("/create",create);
router.get("/getAll", getStudents);
router.get("/getById/:id",getStudentById);
router.put("/update/:id",update);
router.delete("/delete/:id",deleteById);
export default router;