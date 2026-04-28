import { toast } from "react-toastify";
import {
  OpenAIIcon,
  GemmaIcon,
} from "../../../assets/icons";
import cxfCircle from "../../../assets/logos/cxfab_circle1.png";
import Dropdown from "../Dropdown";
import "./styles.css";

const modelIcons = {
  "gemma4:e4b-it-q4_K_M": <GemmaIcon color="currentColor" />,
  "gpt-4o": <OpenAIIcon color="currentColor" />,
  "llama3.2:1b": (
    <img
      src={cxfCircle}
      alt="CXFabric"
      className="model-switcher__image-icon"
    />
  ),
};

function ModelSwitcher({
  className,
  direction,
  modelOptions,
  provider,
  setProvider,
  triggerClassName,
}) {
  const options = modelOptions.map((option) => ({
    ...option,
    icon: modelIcons[option.value],
  }));

  return (
    <Dropdown
      ariaLabel="Select model"
      className={className}
      direction={direction}
      options={options}
      triggerClassName={triggerClassName}
      value={provider}
      onSelect={(option) => {
        setProvider(option.value);
        toast.success(`Switched to ${option.label}`, {
          autoClose: 1800,
          closeOnClick: true,
          draggable: false,
          pauseOnHover: false,
        });
      }}
    />
  );
}

export default ModelSwitcher;
