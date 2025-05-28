import axios from "axios";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Swal from "sweetalert2";

const SUBJECTS = [
  { name: "Math", enum: "Math" },
  { name: "English", enum: "English" },
  { name: "Science", enum: "Science" },
  { name: "Social Studies", enum: "Social_Studies" },
  { name: "Art", enum: "Art" },
];

type Mark = {
  subject: string;
  score: number;
};

type StudentInput = {
  name: string;
  email: string;
  age: string;
  marks: Mark[];
};

type AddStudentsProps = {
  onStudentAdded?: () => void;
};

function AddStudent({ onStudentAdded }: AddStudentsProps) {
  const [show, setShow] = useState(false);
  const [inputs, setInputs] = useState<StudentInput>({
    name: "",
    email: "",
    age: "",
    marks: [],
  });

  const [newMark, setNewMark] = useState<{ subject: string; score: string }>({
    subject: "",
    score: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarkChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewMark((prev) => ({ ...prev, [name]: value }));
  };

  const isValidScore = (score: number) =>
    !isNaN(score) && score >= 0 && score <= 100;

  const resetForm = () => {
    setInputs({ name: "", email: "", age: "", marks: [] });
    setNewMark({ subject: "", score: "" });
    setShow(false);
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
    if (newMark.subject && isValidScore(scoreNum)) {
      setInputs((prev) => ({
        ...prev,
        marks: [...prev.marks, { subject: newMark.subject, score: scoreNum }],
      }));
      setNewMark({ subject: "", score: "" });
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid Score",
        text: "Please select a subject and enter a score between 0 and 100.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/student/create", {
        ...inputs,
        age: parseInt(inputs.age),
      });
      Swal.fire({
        icon: "success",
        title: "Student added successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
      resetForm();
      if (onStudentAdded) {
        onStudentAdded();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Something went wrong while adding the student.",
      });
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShow(true)}>
        Add Student
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Student</Modal.Title>
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

            <h5>Add Subject Score</h5>

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

            {inputs.marks.length > 0 && (
              <div className="w-100">
                <strong>Marks Added:</strong>
                <ul>
                  {inputs.marks.map((mark, index) => (
                    <li key={index}>
                      {mark.subject}: {mark.score}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="d-flex justify-content-end">
              <Button type="submit">Submit</Button>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddStudent;
