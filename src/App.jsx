import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react'

const API_KEY = "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"

function App() {
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: "Hello, i am ChatGPT",
      sender: "ChatGPT" 
    }
  ])

  const handleSend = async(message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]; // all the old message, + the new message

    // update our messages date
    setMessages(newMessages)

    // set a typing indicator (chatgpt is typing)
    setTyping(true)
    // process message to chatGPT (send it over and see the response)
    await processMessageToChatGPT(newMessages);
  }

  async function processMessageToChatGPT(chatMessages) {
    // chatMessages { sender: "user" or "chatGPT", message: "The message content here" }
    // apiMessages { role: "user" or "assistant", content: "The message conent here" }

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "chatGPT") {
        role="assistant"
      } else {
        role = "user"
      }
      return { role: role, content: messageObject.message }
    });

    // role: "user" -> a message from the user, "assistant" -> response from chatGPT
    // "System" -> generally one initial message defining HOW we want chatgpt to takl
    
    const systemMessage = {
      role: "system",
      content: "Explain all concepts like I am 10 years old." // Speak like a pirate, Explain like I am a 10 years of experience software enginer
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages // [message1, message2, message3]
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "chatGPT"
        }]
      );
      setTyping(false);
    })
  }

  return (
    <>
      <div style={{ position: 'relative', height: '800px', width: '700px' }}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior='smooth'
                typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}
              >
                    {messages.map((message, i) => {
                        return <Message key={i} model={message} />
                    })}
              </MessageList>
              <MessageInput placeholder='Type message here' onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
      </div>
    </>
  )
}

export default App
