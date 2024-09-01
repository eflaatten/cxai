import React from "react";
import { FaPaperPlane } from "react-icons/fa";

function Chat({ senderMessage, handleSenderMessageChange, handleSendMessage }) {
  return (
    <div className='chat-container'>
      <div className='chat-messages'>
        {/* Chat messages will be displayed here */}
      </div>
      <div className="chat-message-send">
        <textarea
          className='chat-box'
          placeholder='Message CXAi'
          value={senderMessage}
          onChange={handleSenderMessageChange}
        ></textarea>
        <button type='button' onClick={handleSendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default Chat;
