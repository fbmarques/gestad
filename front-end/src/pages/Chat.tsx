import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdvisorsForStudent,
  getConversation,
  sendMessage,
  AdvisorData,
  MessageData
} from "@/lib/api";

const Chat = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Get advisors list (orientador e coorientador)
  const { data: advisors = [], isLoading: isLoadingAdvisors, error: advisorsError } = useQuery({
    queryKey: ['advisors-for-student'],
    queryFn: getAdvisorsForStudent,
    retry: false,
  });

  // If API returns 401, redirect to login
  useEffect(() => {
    if (advisorsError && (advisorsError as any).response?.status === 401) {
      localStorage.removeItem('auth-token');
      navigate('/login');
    }
  }, [advisorsError, navigate]);

  // For now, we'll use the first advisor (orientador) as default
  const currentAdvisor = advisors.length > 0 ? advisors[0] : null;

  // Get conversation with advisor
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['conversation', currentAdvisor?.id],
    queryFn: () => getConversation(currentAdvisor!.id),
    enabled: !!currentAdvisor,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', currentAdvisor?.id] });
      setNewMessage("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && currentAdvisor) {
      sendMessageMutation.mutate({
        recipient_id: currentAdvisor.id,
        body: newMessage,
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoadingAdvisors) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!currentAdvisor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Você ainda não possui um orientador cadastrado.</p>
          <Button onClick={() => navigate("/discente")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/discente")}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>
              {currentAdvisor.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-foreground">
              {currentAdvisor.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {currentAdvisor.type}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Carregando mensagens...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message: MessageData) => (
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
                        {currentAdvisor.name}
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
                            <span className="text-blue-500">
                              Lida
                            </span>
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
        )}
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
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
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
