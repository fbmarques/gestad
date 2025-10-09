import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Check, CheckCheck, Search, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudentsForTeacher,
  getConversation,
  sendMessage,
  MessageDiscente,
  MessageData
} from "@/lib/api";

const ChatDocente = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDiscente, setSelectedDiscente] = useState<MessageDiscente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get students list
  const { data: discentes = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-for-teacher'],
    queryFn: getStudentsForTeacher,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Get conversation with selected student
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['conversation', selectedDiscente?.id],
    queryFn: () => getConversation(Number(selectedDiscente?.id)),
    enabled: !!selectedDiscente,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedDiscente?.id] });
      queryClient.invalidateQueries({ queryKey: ['students-for-teacher'] });
      queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
      setNewMessage("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredDiscentes = discentes.filter((d: MessageDiscente) =>
    d.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedDiscente) {
      sendMessageMutation.mutate({
        recipient_id: Number(selectedDiscente.id),
        body: newMessage,
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit"
      });
    }
  };

  const getTipoColor = (tipo: string) => {
    return tipo === "mestrado" ? "bg-green-500" : "bg-orange-500";
  };

  const formatReadTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/docente")}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="font-semibold text-foreground">
          Chat com Discentes
        </h1>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Lista de Discentes */}
        <div className="w-80 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar discente..."
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-9rem)]">
            {isLoadingStudents ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando...
              </div>
            ) : (
              <div className="p-2">
                {filteredDiscentes.map((discente: MessageDiscente) => (
                  <Card
                    key={discente.id}
                    className={`p-3 mb-2 cursor-pointer transition-colors hover:bg-accent ${
                      selectedDiscente?.id === discente.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedDiscente(discente)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {discente.nome.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {discente.nome}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getTipoColor(discente.tipo)}`}
                                 title={discente.tipo === "mestrado" ? "Mestrado" : "Doutorado"} />
                          </div>
                          {discente.horaUltimaMensagem && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(discente.horaUltimaMensagem)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate">
                            {discente.ultimaMensagem || "Sem mensagens"}
                          </p>
                          {discente.mensagensNaoLidas! > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {discente.mensagensNaoLidas}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Área de Chat */}
        <div className="flex-1 flex flex-col">
          {selectedDiscente ? (
            <>
              {/* Header do Chat */}
              <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {selectedDiscente.nome.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      {selectedDiscente.nome}
                      <div className={`w-2 h-2 rounded-full ${getTipoColor(selectedDiscente.tipo)}`}
                           title={selectedDiscente.tipo === "mestrado" ? "Mestrado" : "Doutorado"} />
                    </h2>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedDiscente.tipo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4">
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
                        <div className={`max-w-[70%]`}>
                          {message.sender !== "user" && (
                            <div className="flex items-center mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {message.senderName || selectedDiscente.nome}
                              </span>
                            </div>
                          )}

                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.sender === "user"
                                ? "bg-muted"
                                : message.sender === "student"
                                ? "bg-primary text-primary-foreground"
                                : message.sender === "advisor"
                                ? "bg-muted"
                                : message.sender === "co-advisor"
                                ? "bg-amber-50 dark:bg-amber-950 text-foreground"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>

                          <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                            message.sender === "user" ? "justify-end" : "justify-start"
                          }`}>
                            <span>{formatTime(message.timestamp)}</span>
                            {message.sender === "user" && message.readDetails && message.readDetails.length > 0 && (
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                      {message.readDetails.length > 0 ? (
                                        <>
                                          <CheckCheck className="w-3 h-3 text-blue-500" />
                                          <span className="text-blue-500">
                                            Lida por {message.readDetails.length}
                                          </span>
                                        </>
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs" side="top">
                                    <div className="space-y-2">
                                      <p className="font-semibold text-xs mb-2">Lida por:</p>
                                      {message.readDetails.map((detail) => (
                                        <div key={detail.user_id} className="flex flex-col gap-0.5">
                                          <span className="font-medium text-xs">{detail.user_name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {formatReadTime(detail.read_at)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input de Mensagem */}
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione um discente para iniciar a conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDocente;
