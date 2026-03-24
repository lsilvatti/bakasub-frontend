import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/atoms";
import { ChevronLeft } from "lucide-react";

export function GoBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = () => {
    const isFirstEntryInTab = location.key === "default";

    if (!isFirstEntryInTab && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/"); 
    }
  };

  return (
    <Button onClick={handleNavigation} variant="outline" className="mt-4" iconLeft={ChevronLeft}>
      Go Back
    </Button>
  );
}