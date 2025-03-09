import { useNavigate } from "react-router-dom";

function AllAuctions() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/Dashboard"); // Navigates to the Dashboard page
  };

  return (
    <button onClick={handleClick} className="all-auctions-button">
      All Auctions
    </button>
  );
}

export default AllAuctions;
