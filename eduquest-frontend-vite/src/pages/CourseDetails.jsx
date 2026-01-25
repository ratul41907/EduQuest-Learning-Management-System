import { useParams } from "react-router-dom";

export default function CourseDetails() {
  const { id } = useParams();

  return (
    <div className="bg-white rounded-lg border p-6">
      <h1 className="text-xl font-bold">Course Details</h1>
      <p className="mt-2 text-gray-700">Course ID: {id}</p>
      <p className="mt-2 text-gray-700">Day 17 will load course details from backend.</p>
    </div>
  );
}
