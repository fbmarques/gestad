import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
  isRead: boolean;
  readAt?: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Como posso ajudá-lo hoje?",
      sender: "other",
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
      readAt: new Date(Date.now() - 3500000)
    },
    {
      id: "2", 
      text: "Tenho uma dúvida sobre as disciplinas obrigatórias",
      sender: "user",
      timestamp: new Date(Date.now() - 3400000),
      isRead: true,
      readAt: new Date(Date.now() - 3300000)
    },
    {
      id: "3",
      text: "Claro! Posso esclarecer suas dúvidas sobre as disciplinas. Qual disciplina específica você gostaria de saber?",
      sender: "other", 
      timestamp: new Date(Date.now() - 3200000),
      isRead: true,
      readAt: new Date(Date.now() - 3100000)
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
        isRead: false
      };
      
      setMessages([...messages, message]);
      setNewMessage("");
      
      // Simular resposta automática e leitura após um tempo
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, isRead: true, readAt: new Date() } : msg
        ));
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatReadTime = (date: Date) => {
    return `Lida às ${formatTime(date)}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = "/discente"}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-semibold text-foreground">
              Sistema de comunicação
            </h1>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`max-w-[70%] ${message.sender === "user" ? "order-2" : ""}`}>
                {message.sender === "other" && (
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-medium text-foreground">
                      Dr. Teste da Silva
                    </span>
                  </div>
                )}
                
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                
                <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.sender === "user" && (
                    <div className="flex items-center gap-1">
                      {message.isRead ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                          {message.readAt && (
                            <span className="text-blue-500">
                              {formatReadTime(message.readAt)}
                            </span>
                          )}
                        </>
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;