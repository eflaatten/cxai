
import { useRef, useEffect } from 'react';
// import SendIcon from "@mui/icons-material/Send";
// import TooltipWrapper from "../../components/Tooltip";
// import IconButton from "@mui/material/IconButton";
import "../../components/styles/Chat.css";
import { UpArrowIcon, StopIcon } from '../../assets/icons';

const WelcomePage = ({
  darkTheme,
  senderMessage,
  handleSenderMessageChange,
  handleSendMessage,
  isProcessing
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }
}, [senderMessage]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      handleSenderMessageChange({
        target: { value: senderMessage + "\n" },
      });
    }
  };

  return (
    <div className={`chat-container welcome-page ${darkTheme ? "dark-mode" : ""}`} style={{justifyContent: 'center', alignItems: 'center', display: 'flex', minHeight: '100vh'}}>
      <div style={{width: '100%', maxWidth: 1200, margin: '0 auto', textAlign: 'center'}}>
        <h1 style={{marginBottom: 24}}>Ask anything...</h1>
        <div className={`chat-input-container ${darkTheme ? "dark-mode" : ""}`}>
          <textarea
            ref={textareaRef}
            className={`chat-box ${darkTheme ? "dark-mode" : ""}`}
            placeholder='Ask anything...'
            value={senderMessage}
            onChange={handleSenderMessageChange}
            onKeyPress={handleKeyPress}
          />
          <div className='send-button-container'>
            <button type='button' onClick={handleSendMessage} className={`send-button ${darkTheme ? "dark-mode" : ""}`} style={{marginTop: 8}}>
              {isProcessing ? (
                <StopIcon aria-label='Stop processing' sx={{ width: "32px", height: "32px" }} />
              ) : (
                <UpArrowIcon style={{ width: "28px", height: "28px" }} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;