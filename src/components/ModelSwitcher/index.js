import React, { useState, useEffect } from "react";
import {
  CheckIcon,
  DownArrowIcon,
  UpArrowIcon2
} from "../../assets/icons";
import "../styles/ModelSwitcher.css";
import { CpuIcon, CloudIcon } from "lucide-react";
import { OllamaIcon, OpenAIIcon } from "../../assets/icons";
import { toast } from "react-toastify";

const ModelSwitcher = ({ provider, setProvider }) => {
  const [open, setOpen] = useState(false);

  const choose = next => {
    setProvider(next);
    setOpen(false);
    toast.success(`Switched to ${next === "openai" ? "OpenAI" : "Ollama"} provider`, {
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
        {provider === "openai" ? <OpenAIIcon /> : <OllamaIcon />}
        <span className="model-switcher-label">
          {provider === "openai" ? "OpenAI" : "Ollama"}
        </span>
        {open ? <UpArrowIcon2 className="caret" /> : <DownArrowIcon className="caret" />}
      </button>

      {open && (
        <div className="model-switcher-menu">
          <div className="model-switcher-menu-item" onClick={() => choose("openai")}>
            <OpenAIIcon className="model-switcher-menu-icon" /> OpenAI
            {provider === "openai" && <CheckIcon className="check" />}
          </div>
          <div className="model-switcher-menu-item" onClick={() => choose("ollama")}>
            <OllamaIcon className="model-switcher-menu-icon" /> Ollama
            {provider === "ollama" && <CheckIcon className="check" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher;
