import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Send, Check, CheckCheck } from "lucide-react";
import { useCRM } from "@/hooks/useCRM";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const CRMMessages = () => {
  const { messages, loadingMessages, customers, markMessageAsRead } = useCRM();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const filteredMessages = messages?.filter(message =>
    (message as any).crm_customers?.name.toLowerCase().includes(search.toLowerCase()) ||
    message.content.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages?.filter(m => !m.is_read && m.direction === 'incoming').length || 0;

  const customerList = customers?.filter(c => 
    messages?.some(m => m.customer_id === c.id)
  );

  const selectedCustomerMessages = selectedCustomer
    ? messages?.filter(m => m.customer_id === selectedCustomer).sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    : [];

  const handleMarkAsRead = (messageId: string) => {
    markMessageAsRead.mutate(messageId);
  };

  if (loadingMessages) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Conversations
            </span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">{unreadCount}</Badge>
            )}
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-[600px]">
            <div className="space-y-1">
              {customerList?.map((customer) => {
                const customerMessages = messages?.filter(m => m.customer_id === customer.id) || [];
                const lastMessage = customerMessages[0];
                const unread = customerMessages.filter(m => !m.is_read && m.direction === 'incoming').length;

                return (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCustomer === customer.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted/70 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          selectedCustomer === customer.id ? 'bg-primary-foreground/20' : 'bg-primary/10'
                        }`}>
                          <MessageCircle className={`h-5 w-5 ${
                            selectedCustomer === customer.id ? '' : 'text-primary'
                          }`} />
                        </div>
                        <span className="font-semibold">{customer.name}</span>
                      </div>
                      {unread > 0 && (
                        <Badge variant="destructive" className="h-6 min-w-6 p-1 text-xs font-bold animate-pulse">
                          {unread}
                        </Badge>
                      )}
                    </div>
                    {lastMessage && (
                      <p className={`text-sm mt-1 truncate ml-12 ${
                        selectedCustomer === customer.id ? 'opacity-90' : 'opacity-70'
                      }`}>
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                );
              })}
              {(!customerList || customerList.length === 0) && (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground font-medium">No conversations yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Messages will appear here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            {selectedCustomer ? (
              <>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                {customers?.find(c => c.id === selectedCustomer)?.name}
              </>
            ) : (
              "Select a conversation"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {selectedCustomer ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {selectedCustomerMessages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                        message.direction === 'outgoing'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <span className="text-xs opacity-70">
                          {format(new Date(message.created_at), "HH:mm")}
                        </span>
                        {message.direction === 'outgoing' && (
                          message.status === 'read' ? (
                            <CheckCheck className="h-3 w-3 text-blue-400" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )
                        )}
                      </div>
                      {message.direction === 'incoming' && !message.is_read && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs mt-1 hover:underline"
                          onClick={() => handleMarkAsRead(message.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 opacity-30" />
                </div>
                <p className="font-medium">Select a conversation to view messages</p>
                <p className="text-sm mt-1">Choose a customer from the list</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMMessages;
