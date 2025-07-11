import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import Swal from "sweetalert2";
import type { Student } from "../types";

const SUBJECTS = [
  { name: "Math", enum: "Math" },
  { name: "English", enum: "English" },
  { name: "Science", enum: "Science" },
  { name: "Social Studies", enum: "Social_Studies" },
  { name: "Art", enum: "Art" },
];

function UpdateStudent({
  student,
  closeHandler,
}: {
  student: Student;
  closeHandler: () => void;
}) {
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    age: "",
    marks: [] as { subject: string; score: number }[],
  });

  const [newMark, setNewMark] = useState({ subject: "", score: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarkChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMark((prev) => ({ ...prev, [name]: value }));
  };

  const addMark = () => {
    const scoreNum = parseFloat(newMark.score);
    
    if (inputs.marks.find((mark) => mark.subject === newMark.subject)) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Subject",
        text: "You have already added a mark for this subject.",
      });
      return;
    }

    if (
      newMark.subject &&
      !isNaN(scoreNum) &&
      scoreNum >= 0 &&
      scoreNum <= 100
    ) {
      setInputs((prev) => ({
        ...prev,
        marks: [...prev.marks, { subject: newMark.subject, score: scoreNum }],
      }));
      setNewMark({ subject: "", score: "" });
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Please select a subject and enter a valid score between 0 and 100.",
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    axios.put(`http://localhost:8080/api/student/update/${student.id}`, {...inputs, age: parseInt(inputs.age)})
      .then(response => {
        console.log("Student updated successfully:", response.data);
        Swal.fire({
          title: "Success!",
          text: "Student information updated successfully",
          icon: "success",
          confirmButtonText: "OK"
        });
        closeHandler(); 
      })
      .catch(error => {
        console.error("Error updating student:", error);
        Swal.fire({
          title: "Error!",
          text: `Failed to update student information: ${error.message}`,
          icon: "error",
          confirmButtonText: "OK"
        });
      });
  };

  useEffect(() => {
    setInputs({
      name: student.name,
      email: student.email,
      age: student.age,
      marks: [],
    });
  }, []);

  return (
    <>
      <Modal show={Boolean(student.id)} onHide={closeHandler}>
        <Modal.Header closeButton>
          <Modal.Title>Update Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="John Doe"
                value={inputs.name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="name@example.com"
                value={inputs.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                name="age"
                value={inputs.age}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Marks Entry */}
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Select
                name="subject"
                value={newMark.subject}
                onChange={handleMarkChange}
              >
                <option value="">Select Subject</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject.enum} value={subject.enum}>
                    {subject.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Score</Form.Label>
              <Form.Control
                type="number"
                name="score"
                value={newMark.score}
                onChange={handleMarkChange}
                min={0}
                max={100}
              />
            </Form.Group>

            <Button variant="secondary" onClick={addMark} className="mb-3">
              Add Subject Score
            </Button>

            <div className="mb-3">
              <strong>Marks Added:</strong>
              <ul>
                {inputs.marks.map((mark, index) => (
                  <li key={index}>
                    {mark.subject}: {mark.score}
                  </li>
                ))}
              </ul>
            </div>

            <Button type="submit">Submit</Button>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeHandler}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UpdateStudent;
