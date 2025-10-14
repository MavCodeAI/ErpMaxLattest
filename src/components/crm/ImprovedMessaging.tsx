import { useState } from "react";
import { useCRM } from "@/hooks/useCRM";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, FileText, Zap, Star, Archive, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TemplatesDialog } from "./TemplatesDialog";
import { QuickRepliesDialog } from "./QuickRepliesDialog";
import { useCRMEnhancements } from "@/hooks/useCRMEnhancements";
import { formatDistanceToNow } from "date-fns";

export const ImprovedMessaging = () => {
  const { customers, messages, loadingMessages, markMessageAsRead } = useCRM();
  const { updateConversationMetadata } = useCRMEnhancements();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const filteredMessages = messages.filter((msg) => {
    const customer = customers.find((c) => c.id === msg.customer_id);
    const searchLower = searchQuery.toLowerCase();
    return (
      customer?.name.toLowerCase().includes(searchLower) ||
      msg.content.toLowerCase().includes(searchLower)
    );
  });

  const customerList = customers
    .filter((customer) => messages.some((msg) => msg.customer_id === customer.id))
    .map((customer) => {
      const customerMessages = messages.filter((msg) => msg.customer_id === customer.id);
      const lastMessage = customerMessages.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      const unreadCount = customerMessages.filter((msg) => msg.direction === "incoming" && !msg.is_read).length;

      return {
        ...customer,
        lastMessage,
        unreadCount,
      };
    })
    .sort((a, b) => {
      if (!a.lastMessage || !b.lastMessage) return 0;
      return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
    });

  const selectedCustomer = selectedCustomerId
    ? customerList.find((c) => c.id === selectedCustomerId)
    : null;

  const selectedCustomerMessages = selectedCustomerId
    ? messages
        .filter((msg) => msg.customer_id === selectedCustomerId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  const handleSend = () => {
    if (!messageText.trim()) return;
    console.log("Sending message:", messageText);
    setMessageText("");
  };

  const toggleStar = async (customerId: string) => {
    await updateConversationMetadata.mutateAsync({
      customerId,
      updates: { is_starred: true },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
      {/* Conversations List */}
      <Card className="md:col-span-1 flex flex-col">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Messages</h3>
            <Badge variant="secondary">{customerList.reduce((sum, c) => sum + c.unreadCount, 0)}</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loadingMessages ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : customerList.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
          ) : (
            <div className="divide-y">
              {customerList.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                    selectedCustomerId === customer.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold truncate">{customer.name}</h4>
                        {customer.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(customer.lastMessage.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {customer.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">{customer.lastMessage.content}</p>
                      )}
                      {customer.unreadCount > 0 && (
                        <Badge variant="default" className="mt-1">
                          {customer.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Message Thread */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedCustomer ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedCustomer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.whatsapp_number}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => toggleStar(selectedCustomer.id)}>
                  <Star className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedCustomerMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.direction === "outgoing"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.direction === "outgoing" && msg.is_read && (
                          <span className="text-xs opacity-70">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickReplies(true)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Replies
                </Button>
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={2}
                  className="resize-none"
                />
                <Button onClick={handleSend} size="icon" className="h-auto">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </Card>

      <TemplatesDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelectTemplate={(content) => setMessageText(content)}
      />
      <QuickRepliesDialog
        open={showQuickReplies}
        onOpenChange={setShowQuickReplies}
        onSelectReply={(content) => setMessageText(content)}
      />
    </div>
  );
};
