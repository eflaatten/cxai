import React, { useState, useEffect } from "react";
import {
  CheckIcon,
  DownArrowIcon,
  UpArrowIcon2
} from "../../assets/icons";
import "../styles/ModelSwitcher.css";
import { OllamaIcon, OpenAIIcon, MakoNetworksIcon } from "../../assets/icons";
import { toast } from "react-toastify";
import cxf_circle from "../../assets/logos/cxfab_circle1.png";

const ModelSwitcher = ({ provider, setProvider, modelOptions }) => {
  const [open, setOpen] = useState(false);
  const currentModel = modelOptions.find(m => m.value === provider);

  const modelIcons = {
    "gpt-4o": <OpenAIIcon />,
    "llama3.2:1b": <img src={cxf_circle} alt="CXFabric Logo" className="model-switcher-menu-icon" />,
  };

  const choose = next => {
    setProvider(next);
    setOpen(false);
    toast.success(`Switched to ${modelOptions.find(m => m.value === next)?.label || next} provider`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
    });
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="model-switcher-wrapper" onClick={e => e.stopPropagation()}>
      <button className="model-switcher-btn" onClick={() => setOpen(o => !o)}>
        {modelIcons[provider] || <OllamaIcon />}
        <span className="model-switcher-label">
          {currentModel?.label || provider}
        </span>
        {open ? <UpArrowIcon2 className="caret" /> : <DownArrowIcon className="caret" />}
      </button>

      {open && (
        <div className="model-switcher-menu">
          {modelOptions.map(opt => (
            <div
              key={opt.value}
              className="model-switcher-menu-item"
              onClick={() => choose(opt.value)}
            >
              {modelIcons[opt.value] || <OllamaIcon className="model-switcher-menu-icon" />}
              {opt.label}
              {provider === opt.value && <CheckIcon className="check" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher;
