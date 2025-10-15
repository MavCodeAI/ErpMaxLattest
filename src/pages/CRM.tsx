import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, MessageSquare, Settings, TrendingUp, DollarSign } from "lucide-react";
import { useCRM } from "@/hooks/useCRM";
import { formatCurrency } from "@/utils/currency";
import CRMCustomers from "@/components/crm/CRMCustomers";
import CRMOrders from "@/components/crm/CRMOrders";
import { ImprovedMessaging } from "@/components/crm/ImprovedMessaging";
import CRMProviders from "@/components/crm/CRMProviders";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Customer Relationship Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage customers, orders, and WhatsApp communications
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="flex md:grid md:grid-cols-5 gap-1 w-full min-w-[520px] md:min-w-0 overflow-x-auto whitespace-nowrap">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-xs sm:text-sm">
              Customers
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm">
              Orders
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-xs sm:text-sm">
              Messages
              {stats.unreadMessages > 0 && (
                <Badge variant="destructive" className="ml-1 sm:ml-2 h-5 min-w-[20px] text-xs">
                  {stats.unreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="providers" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">WhatsApp Setup</span>
              <span className="sm:hidden">Setup</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active customer base
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingOrders} pending orders
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.unreadMessages}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Needs your attention
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From all orders
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {orders?.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold">{order.crm_customers?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.order_id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
                        <Badge variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'in_progress' ? 'secondary' :
                          order.status === 'cancelled' ? 'destructive' : 'outline'
                        } className="mt-1">
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!orders || orders.length === 0) && (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Recent Messages
                </CardTitle>
                <CardDescription>Latest WhatsApp conversations</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {messages?.slice(0, 5).map((message: any) => (
                    <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        message.direction === 'incoming' ? 'bg-blue-500/10' : 'bg-green-500/10'
                      }`}>
                        <MessageSquare className={`h-5 w-5 ${
                          message.direction === 'incoming' ? 'text-blue-500' : 'text-green-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold truncate">{message.crm_customers?.name}</p>
                          {!message.is_read && message.direction === 'incoming' && (
                            <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!messages || messages.length === 0) && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-muted-foreground">No messages yet</p>
                    </div>
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
          <ImprovedMessaging />
        </TabsContent>

        <TabsContent value="providers">
          <CRMProviders />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRM;
