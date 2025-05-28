import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import UpdateStudent from "./UpdateStudent";
import AddStudents from "./AddStudents";
import type { Student, Meta } from "../types";

interface Mark {
  id: string;
  subject: string;
  score: number;
  studentId: string;
}

const StudentTable: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [meta, setMeta] = useState<Meta>({
    page: 0,
    limit: 0,
    total: 0,
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const studentsPerPage = 10;

  const fetchStudents = () => {
    axios
      .get(
        `http://localhost:8080/api/student/getAll?page=${currentPage}&limit=${studentsPerPage}`
      )
      .then(({ data }) => {
        setStudents(data.data);
        setMeta(data.meta);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/student/delete/${id}`);
        fetchStudents();
        Swal.fire("Deleted!", "Student has been deleted.", "success");
      } catch (error) {
        Swal.fire(`Error!`, `Failed to delete student. ${error}`, "error");
      }
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
  };

  const closeUpdateModal = () => {
    setSelectedStudent(null);
    fetchStudents();
  };

  const getMarkBySubject = (marks: Mark[], subject: string): string => {
    const mark = marks.find(
      (m) => m.subject.toLowerCase() === subject.toLowerCase()
    );
    return mark ? mark.score.toString() : "-";
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Student Records</h2>
        <AddStudents onStudentAdded={fetchStudents} />
      </div>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Serial No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Math</th>
            <th>Science</th>
            <th>English</th>
            <th>Social Studies</th>
            <th>Art</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td>{(meta.page - 1) * meta.limit + index + 1}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.age}</td>
              <td>{getMarkBySubject(student.marks, "Math")}</td>
              <td>{getMarkBySubject(student.marks, "Science")}</td>
              <td>{getMarkBySubject(student.marks, "English")}</td>
              <td>{getMarkBySubject(student.marks, "Social_Studies")}</td>
              <td>{getMarkBySubject(student.marks, "Art")}</td>
              <td>
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => handleEdit(student)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(student.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={10} className="text-center">
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
        </span>
        <button
          className="btn btn-secondary"
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(meta.total / meta.limit))
            )
          }
          disabled={currentPage === Math.ceil(meta.total / meta.limit)}
        >
          Next
        </button>
      </div>

      {selectedStudent && (
        <UpdateStudent
          student={selectedStudent}
          closeHandler={closeUpdateModal}
        />
      )}
    </div>
  );
};

export default StudentTable;
