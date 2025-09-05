import { useNavigate } from "react-router";
import { toast } from "sonner";

export const usePlaygroundNavigation = () => {
  const navigate = useNavigate();

  /**
   * Switch Active Playground
   * - Navigates to new playground URL
   * - React Router will update params and trigger snapshot reload
   */
  const setActivePlayground = async (id: number) => {
    try {
      navigate(`/playground/${id}`);
    } catch (e) {
      toast.error("Failed to switch playground");
      console.error(e);
    }
  };

  return {
    setActivePlayground,
  };
};
