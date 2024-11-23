import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const DishList = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const fileInputRef = useRef(null); // Ref for file input (used by both upload and camera)

  // Fetch dishes on component mount
  useEffect(() => {
    const fetchDishes = async () => {
        try {
            // setLoading(true);
        const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}shopping`,
            {
                withCredentials: true, // Ensure cookies are sent with the request
              }
        );
         setDishes(response.data.data); // Assuming the API response is structured as { data: [ ... ] }
        setLoading(false);
      } catch (err) {
        setError("Error fetching dishes");
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  const handleUploadChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file); // Store the file object, not the URL
      handleSubmitImage(file); // Automatically submit when a file is selected
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click(); // Trigger file input click when button is clicked
  };

  const handleCameraClick = () => {
    fileInputRef.current.click(); // Trigger camera input click
  };

  const handleSubmitImage = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file); // Append image file to form data

      try {
        setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}shopping`, // Backend URL for image upload
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important header for file upload
          },
        }
      );
      console.log(response.data); // Handle success response

      // Assuming the server responds with the new dish in `response.data.newDish`
      const newDish = response.data.newDish;

        // Update the dishes state by creating a new array with the new dish
        setTimeout(() => {
            window.location.reload();
            setLoading(false);// Refresh the page
          }, 7000);
        // setDishes((prevDishes) => [newDish, ...prevDishes]); // This ensures re-render
        // setLoading(false);
      
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-xl text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 ml-10">Available Dishes</h1>
        <div className="flex space-x-4">
          {/* Upload Button */}
          <button
            onClick={handleUploadClick} // Trigger file input click when this button is clicked
            className="bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600 transition-all"
          >
            Upload Image
          </button>

          {/* Camera Button */}
          <button
            onClick={handleCameraClick} // Trigger camera input click
            className="bg-green-500 text-white p-2 rounded-lg shadow-lg hover:bg-green-600 transition-all"
          >
            Capture Image
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadChange}
            className="hidden"
            ref={fileInputRef} // Reference the file input with the ref
            capture="camera" // This triggers the camera on supported devices
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map((dish) => (
          <div
            key={dish._id}
            className="card-container transform transition-all duration-300 ease-in-out hover:scale-105"
            onClick={() => setSelectedCard(dish)}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all cursor-pointer h-full flex flex-col justify-between">
              <img
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt={dish.name}
                className="w-full h-48 object-cover rounded-md mb-4 transition-all duration-300 ease-in-out transform hover:scale-105"
              />
              <h2 className="text-xl font-semibold text-gray-800">{dish.name}</h2>
              <p className="text-gray-600 mt-2">
                <strong>Calories:</strong> {dish.nutritionalInfo?.calories} kcal
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] p-8 rounded-lg shadow-2xl overflow-y-auto transform transition-all duration-500 ease-in-out scale-105 opacity-100">
            <button
              className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full p-3 focus:outline-none shadow-md transition-all"
              onClick={() => setSelectedCard(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {selectedCard.name}
            </h2>
            <div className="space-y-4 text-lg text-gray-700">
              <p>
                <strong>Calories:</strong> {selectedCard.nutritionalInfo?.calories} kcal
              </p>
              <p>
                <strong>Cuisine:</strong> {selectedCard.cuisineType}
              </p>
              <p>
                <strong>Carbs:</strong> {selectedCard.nutritionalInfo?.carbs} g
              </p>
              <p>
                <strong>Protein:</strong> {selectedCard.nutritionalInfo?.protein} g
              </p>
              <p>
                <strong>Fat:</strong> {selectedCard.nutritionalInfo?.fats} g
              </p>
              {/* <p>
                <strong>Price:</strong> ${selectedCard.price}
              </p> */}
              <p>{selectedCard.description}</p>
              <h3 className="text-2xl font-semibold text-gray-800 mt-4">Recipe:</h3>
              <p>{selectedCard.recipe}</p> {/* Displaying the recipe */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishList;
