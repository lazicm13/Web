import React, { useState, ChangeEvent, FormEvent } from 'react';

const DriverRating: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRatingChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setRating(parseInt(e.target.value));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage("Please select a rating.");
      return;
    }
    try {
      // Slanje ocene kao URL parametar
      const response = await fetch(`http://localhost:8149/api/driver/rate-driver/${rating}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Error submitting rating");
      }

      const result = await response.json();
      console.log("Rating submitted:", result);
    } catch (error) {
      console.error("There was an error submitting the rating:", error);
      setErrorMessage("There was an issue submitting your rating. Please try again.");
    }
  };

  return (
    <div>
      <h1>Your ride is completed!</h1>
      <h2>Please rate your driver:</h2>
      <form onSubmit={handleSubmit}>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star}>
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={handleRatingChange}
              />
              <span className={star <= rating ? "filled-star" : "empty-star"}>
                ★
              </span>
            </label>
          ))}
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit">Submit Rating</button>
      </form>
      <style>{`
        .star-rating {
          display: flex;
          flex-direction: row-reverse;
          justify-content: center;
        }

        .star-rating input {
          display: none;
        }

        .star-rating label {
          cursor: pointer;
        }

        .filled-star, .empty-star {
          font-size: 2rem;
          color: gold;
          transition: color 0.2s;
        }

        .empty-star {
          color: lightgray;
        }
      `}</style>
    </div>
  );
};

export default DriverRating;
