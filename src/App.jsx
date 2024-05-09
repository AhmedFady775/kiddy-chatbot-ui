import { SquarePen, SendHorizontal } from "lucide-react";
import React from "react";

function Sidebar({ setChatId, oldChats }) {
  return (
    <div className="h-full bg-white/90 rounded-[10px] backdrop-blur p-6 flex flex-col w-[20%] justify-between">
      <div className="flex flex-col gap-4">
        <div
          onClick={() => setChatId(null)}
          className="flex items-center justify-between hover:bg-primary/50 bg-primary px-4 py-2 rounded-[6px] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <img src="/logo-01.png" className="w-10 h-10 rounded-full" />
            <p className="font-medium">New Chat</p>
          </div>
          <SquarePen size={20} />
        </div>
        <div className="flex flex-col gap-4">
          {oldChats.map(({ title, chatId }) => (
            <div
              onClick={() => setChatId(chatId)}
              key={chatId}
              className="flex items-center gap-4 rounded-[6px] transition-all cursor-pointer"
            >
              <p className="font-medium">{title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-[6px] transition-all cursor-pointer">
        <img src="/avatar.png" className="w-12 h-12" />
        <div>
          <p className="font-medium">Ahmed Fady</p>
          <p className="text-sm">User</p>
        </div>
      </div>
    </div>
  );
}

function NewChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-10">
      <img src="/logo-01.png" className="w-48 h-48" />
      <div className="flex flex-col items-center gap-2">
        <p className="text-5xl font-medium">
          Hi kiddo! I am your kiddy chatbot
        </p>
        <p className="text-xl">Do you want to ask me about something today?</p>
      </div>
    </div>
  );
}

function SentMessage({ key, message }) {
  return (
    <div className="flex flex-col gap-3 w-[60%]" key={key}>
      <div className="flex items-center gap-3 ">
        <img src="/avatar.png" className="w-10 h-10 rounded-full" />
        <p className="text font-medium">Ahmed Fady</p>
      </div>
      <div className="rounded-lg bg-gray-100 p-4">{message}</div>
    </div>
  );
}
function ReceivedMessage({ key, message }) {
  return (
    <div className="flex flex-col gap-3 w-[60%]" key={key}>
      <div className="flex items-center gap-3">
        <img src="/logo-01.png" className="w-10 h-10 rounded-full" />
        <p className="text font-medium">Kiddy</p>
      </div>
      <div className="rounded-lg bg-primary p-4">{message}</div>
    </div>
  );
}

function ChatHistory({ messages, chatId }) {
  return (
    <div className="flex flex-col items-center h-full gap-8 py-10 overflow-y-auto">
      {messages[chatId].map(({ role, content }, index) =>
        role === "user" ? (
          <SentMessage key={index} message={content} />
        ) : (
          <ReceivedMessage key={index} message={content} />
        )
      )}
    </div>
  );
}

function Chat({ chatId, setChatId, oldChats, setOldChats }) {
  const [messages, setMessages] = React.useState({});
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    console.log(chatId);
    console.log(messages);
    if (chatId) {
      const fetchChatHistory = async () => {
        const res = await fetch(
          `https://72d1-41-43-198-237.ngrok-free.app/chat/${chatId}`
        );
        const data = await res.json();
        console.log(data);
        setMessages({ ...messages, [chatId]: data.chat });
      };
      fetchChatHistory();
    }
  }, [chatId]);

  async function handleSendMessage(e) {
    e.preventDefault();

    setLoading(true);

    let currentChatId;
    if (!chatId) {
      const res = await fetch(
        "https://72d1-41-43-198-237.ngrok-free.app/create_chat",
        {
          method: "GET",
        }
      );
      const data = await res.json();
      setChatId(data.newChat._id);
      currentChatId = data.newChat._id;
      console.log(data);
      const newChatHistory = [
        ...oldChats,
        { title: prompt, chatId: data.newChat._id },
      ];
      setOldChats(newChatHistory);
      localStorage.setItem("oldChats", JSON.stringify(newChatHistory));
      setMessages((prevMessage) => {
        return {
          ...prevMessage,
          [currentChatId]: [
            { role: "user", content: prompt },
            { role: "assistnant", content: "Let me think 🤔💭..." },
          ],
        };
      });
    } else {
      currentChatId = chatId;
      setMessages((prevMessage) => {
        return {
          ...prevMessage,
          [currentChatId]: [
            ...prevMessage[currentChatId],
            { role: "user", content: prompt },
            { role: "assistnant", content: "Let me think 🤔💭..." },
          ],
        };
      });
    }

    console.log(messages);
    const res = await fetch(
      "https://72d1-41-43-198-237.ngrok-free.app/send_message",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId: currentChatId, message: prompt }),
      }
    );
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullMessage = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunckdata = decoder.decode(value, { stream: true });
      console.log(chunckdata);
      try {
        const chunkJson = JSON.parse(chunckdata);

        if (!chunkJson.done) {
          fullMessage += chunkJson.message.content;
          setMessages((prevMessage) => {
            const currentChat = [...prevMessage[currentChatId]];
            currentChat[currentChat.length - 1].content = fullMessage;
            return {
              ...prevMessage,
              [currentChatId]: currentChat,
            };
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="h-full bg-white/90 rounded-[10px] backdrop-blur flex flex-col w-[80%] justify-between">
      <div className="px-12 py-6 border-b items-center flex text-2xl font-medium ">
        Kiddy Chatbot
      </div>
      {!messages[chatId] ? (
        <NewChat />
      ) : (
        <ChatHistory messages={messages} chatId={chatId} />
      )}
      <div className="pb-16 flex flex-col gap-4">
        <form onSubmit={handleSendMessage} className="flex justify-center">
          <textarea
            disabled={loading}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            placeholder="Hey there! How about writing a fun message to our friendly kiddy chatbot? You can tell it about your favorite toy..."
            className="p-4 w-[60%] rounded-y-[10px] group border-r-none rounded-l-[10px] border-y border-l focus:outline-none focus:border-primary focus:ring-primary resize-none transition-all"
          />
          <button
            disabled={loading}
            onClick={handleSendMessage}
            className="p-4 flex items-center justify-center bg-white rounded-r-[10px] border-y border-r group-border-primary hover:text-[#66c5c9] transition-all"
          >
            <SendHorizontal />
          </button>
        </form>
        <p className="flex justify-center text-xs">
          © 2023 Kiddy chatbot, all rights reserved.
        </p>
      </div>
    </div>
  );
}

function App() {
  const [chatId, setChatId] = React.useState(null);
  const [oldChats, setOldChats] = React.useState([]);

  // get old chatIDs from localStorage
  React.useEffect(() => {
    const oldChatsHistory = JSON.parse(localStorage.getItem("oldChats")) || [];
    if (oldChatsHistory.length === 0) {
      localStorage.setItem("oldChats", JSON.stringify([]));
    }
    setOldChats(oldChatsHistory);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[url('/bbg-01.png')]">
      <div className="flex p-6 w-full gap-6">
        <Sidebar setChatId={setChatId} oldChats={oldChats} />
        <Chat
          chatId={chatId}
          setChatId={setChatId}
          oldChats={oldChats}
          setOldChats={setOldChats}
        />
      </div>
    </div>
  );
}

export default App;
