import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Check, CheckCheck, Search, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Discente {
  id: string;
  nome: string;
  tipo: "mestrado" | "doutorado";
  ultimaMensagem?: string;
  horaUltimaMensagem?: Date;
  mensagensNaoLidas?: number;
}

interface Message {
  id: string;
  text: string;
  sender: "docente" | "discente";
  timestamp: Date;
  isRead: boolean;
  readAt?: Date;
}

const ChatDocente = () => {
  const [selectedDiscente, setSelectedDiscente] = useState<Discente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  
  // Lista de discentes mockada
  const [discentes] = useState<Discente[]>([
    {
      id: "1",
      nome: "João Silva",
      tipo: "mestrado",
      ultimaMensagem: "Obrigado pela orientação!",
      horaUltimaMensagem: new Date(Date.now() - 3600000),
      mensagensNaoLidas: 2
    },
    {
      id: "2",
      nome: "Maria Santos",
      tipo: "doutorado",
      ultimaMensagem: "Quando podemos marcar uma reunião?",
      horaUltimaMensagem: new Date(Date.now() - 7200000),
      mensagensNaoLidas: 0
    },
    {
      id: "3",
      nome: "Pedro Costa",
      tipo: "mestrado",
      ultimaMensagem: "Enviei o capítulo 2 para revisão",
      horaUltimaMensagem: new Date(Date.now() - 86400000),
      mensagensNaoLidas: 1
    },
    {
      id: "4",
      nome: "Ana Paula",
      tipo: "doutorado",
      ultimaMensagem: "Preciso de ajuda com a metodologia",
      horaUltimaMensagem: new Date(Date.now() - 172800000),
      mensagensNaoLidas: 0
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bom dia, professor! Tudo bem?",
      sender: "discente",
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      readAt: new Date(Date.now() - 7100000)
    },
    {
      id: "2",
      text: "Bom dia! Tudo ótimo, e você?",
      sender: "docente",
      timestamp: new Date(Date.now() - 7000000),
      isRead: true,
      readAt: new Date(Date.now() - 6900000)
    },
    {
      id: "3",
      text: "Obrigado pela orientação!",
      sender: "discente",
      timestamp: new Date(Date.now() - 3600000),
      isRead: false
    }
  ]);

  const filteredDiscentes = discentes.filter(d => 
    d.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedDiscente) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "docente",
        timestamp: new Date(),
        isRead: false
      };
      
      setMessages([...messages, message]);
      setNewMessage("");
      
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, isRead: true, readAt: new Date() } : msg
        ));
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = "/docente"}
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
            <div className="p-2">
              {filteredDiscentes.map((discente) => (
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
                          {discente.ultimaMensagem}
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
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "docente" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`max-w-[70%]`}>
                        {message.sender === "discente" && (
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {selectedDiscente.nome}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.sender === "docente"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        
                        <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                          message.sender === "docente" ? "justify-end" : "justify-start"
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.sender === "docente" && (
                            <div className="flex items-center gap-1">
                              {message.isRead ? (
                                <>
                                  <CheckCheck className="w-3 h-3 text-blue-500" />
                                  {message.readAt && (
                                    <span className="text-blue-500">
                                      Lida
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
