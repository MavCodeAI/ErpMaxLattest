import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, MessageSquare, Settings } from "lucide-react";
import { useCRM } from "@/hooks/useCRM";
import { formatCurrency } from "@/utils/currency";
import CRMCustomers from "@/components/crm/CRMCustomers";
import CRMOrders from "@/components/crm/CRMOrders";
import CRMMessages from "@/components/crm/CRMMessages";
import CRMProviders from "@/components/crm/CRMProviders";

const CRM = () => {
  const { customers, orders, messages } = useCRM();
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = {
    totalCustomers: customers?.length || 0,
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
    unreadMessages: messages?.filter(m => !m.is_read && m.direction === 'incoming').length || 0,
    totalRevenue: orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="text-muted-foreground">
          Manage customers, orders, and WhatsApp communications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="messages">
            Messages
            {stats.unreadMessages > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.unreadMessages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="providers">WhatsApp Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Active customer base
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingOrders} pending orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Needs your attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  From all orders
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders?.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.crm_customers?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.order_id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                        <Badge variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'in_progress' ? 'secondary' :
                          order.status === 'cancelled' ? 'destructive' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!orders || orders.length === 0) && (
                    <p className="text-center text-muted-foreground">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Latest WhatsApp conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages?.slice(0, 5).map((message: any) => (
                    <div key={message.id} className="flex items-start gap-3">
                      <MessageSquare className={`h-5 w-5 ${
                        message.direction === 'incoming' ? 'text-blue-500' : 'text-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{message.crm_customers?.name}</p>
                          {!message.is_read && message.direction === 'incoming' && (
                            <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!messages || messages.length === 0) && (
                    <p className="text-center text-muted-foreground">No messages yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <CRMCustomers />
        </TabsContent>

        <TabsContent value="orders">
          <CRMOrders />
        </TabsContent>

        <TabsContent value="messages">
          <CRMMessages />
        </TabsContent>

        <TabsContent value="providers">
          <CRMProviders />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRM;
