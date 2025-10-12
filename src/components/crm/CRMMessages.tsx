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
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conversations</span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {customerList?.map((customer) => {
                const customerMessages = messages?.filter(m => m.customer_id === customer.id) || [];
                const lastMessage = customerMessages[0];
                const unread = customerMessages.filter(m => !m.is_read && m.direction === 'incoming').length;

                return (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCustomer === customer.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-medium">{customer.name}</span>
                      </div>
                      {unread > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 p-1 text-xs">
                          {unread}
                        </Badge>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-sm mt-1 truncate opacity-80">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                );
              })}
              {(!customerList || customerList.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No conversations yet
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedCustomer
              ? customers?.find(c => c.id === selectedCustomer)?.name
              : "Select a conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCustomer ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {selectedCustomerMessages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.direction === 'outgoing'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {format(new Date(message.created_at), "HH:mm")}
                        </span>
                        {message.direction === 'outgoing' && (
                          message.status === 'read' ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )
                        )}
                      </div>
                      {message.direction === 'incoming' && !message.is_read && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
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
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMMessages;
