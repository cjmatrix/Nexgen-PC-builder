  import {
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaBox,
  FaFan,
  FaBolt,
  FaDesktop,
} from "react-icons/fa";
import { BsGpuCard, BsStars, BsCpu } from "react-icons/bs";
  
  const getComponentIcon = (category) => {
    const iconClass = "w-5 h-5";
    switch (category?.toLowerCase()) {
      case "cpu":
        return <BsCpu className={`${iconClass} text-blue-500`} />;
      case "gpu":
        return <BsGpuCard className={`${iconClass} text-green-500`} />;
      case "motherboard":
        return <FaBox className={`${iconClass} text-purple-500`} />;
      case "ram":
        return <FaMemory className={`${iconClass} text-yellow-500`} />;
      case "storage":
        return <FaHdd className={`${iconClass} text-red-500`} />;
      case "case":
        return <FaDesktop className={`${iconClass} text-gray-500`} />;
      case "psu":
        return <FaBolt className={`${iconClass} text-yellow-600`} />;
      case "cooler":
        return <FaFan className={`${iconClass} text-cyan-500`} />;
      default:
        return <FaBox className={`${iconClass} text-gray-400`} />;
    }
  };

  export default getComponentIcon;