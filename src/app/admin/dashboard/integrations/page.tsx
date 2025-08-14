
"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Settings, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const integrations = [
  {
    name: "Google Sheets",
    description: "Sync your data automatically to Google Sheets.",
    logo: "https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png",
    enabled: true,
  },
  {
    name: "Instagram",
    description: "Connect your Instagram account for marketing.",
    logo: "https://res.cloudinary.com/dc367rgig/image/upload/v1717659491/instagram-logo_rpx30v.png",
    enabled: false,
  },
  {
    name: "Facebook",
    description: "Integrate with Facebook for ads and sales.",
    logo: "https://res.cloudinary.com/dc367rgig/image/upload/v1717659616/facebook-logo_t9fsb5.png",
    enabled: false,
  },
    {
    name: "Slack",
    description: "Get notifications for new orders in Slack.",
    logo: "https://res.cloudinary.com/dc367rgig/image/upload/v1717659779/slack-logo_w72g5b.png",
    enabled: false,
  },
  {
    name: "Mailchimp",
    description: "Sync customers with your Mailchimp audience.",
    logo: "https://res.cloudinary.com/dc367rgig/image/upload/v1717659858/mailchimp-logo_rchp5g.png",
    enabled: false,
  },
  {
    name: "Zapier",
    description: "Connect your store to thousands of apps.",
    logo: "https://res.cloudinary.com/dc367rgig/image/upload/v1717659918/zapier-logo_x9x8pl.png",
    enabled: false,
  },
    {
    name: "Stripe",
    description: "Enable payments with Stripe.",
    logo: "https://res.cloudinary.com/dc367rgig/image/upload/v1717660002/stripe-logo_nsyq7j.png",
    enabled: false,
    },
    {
    name: "Shopify",
    description: "Sync your products with a Shopify store.",
    logo: "https://res.cloudinary.com/dc367rgig/image/upload/v1717660064/shopify-logo_p3y3k5.png",
    enabled: false,
    },
    {
    name: "QuickBooks",
    description: "Sync your sales data with QuickBooks.",
    logo: "https://res.cloudinary.com/dc367rgig/image/upload/v1717660124/quickbooks-logo_u2uytv.png",
    enabled: false,
    },
];

export default function IntegrationsPage() {
    const [enabledIntegrations, setEnabledIntegrations] = useState(
        integrations.filter(i => i.enabled).map(i => i.name)
    );

    const handleToggle = (name: string) => {
        setEnabledIntegrations(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect your store with third-party apps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(integration => (
          <Card key={integration.name} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-4">
                 <Image src={integration.logo} alt={integration.name} width={40} height={40} />
                 <div>
                    <CardTitle>{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                </div>
              </div>
              <Switch
                checked={enabledIntegrations.includes(integration.name)}
                onCheckedChange={() => handleToggle(integration.name)}
              />
            </CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <CardContent className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4"/>
                    Learn More
                </Button>
               {integration.name === "Google Sheets" ? (
                 <Dialog>
                    <DialogTrigger asChild>
                       <Button size="sm">
                          <Settings className="mr-2 h-4 w-4"/>
                          Settings
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Google Sheets Integration</DialogTitle>
                            <DialogDescription>
                                Configure your Google Sheets integration to sync data.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                           <p className="text-sm text-muted-foreground">
                                To get started, you'll need to authorize this application to access your Google Sheets.
                           </p>
                           <div className="p-4 bg-secondary rounded-md space-y-2">
                                <h4 className="font-semibold">Step 1: Get Your Credentials</h4>
                                <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-2">
                                    <li>Navigate to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console</a>.</li>
                                    <li>If you don't have a project, create a new one.</li>
                                    <li>Go to <strong>APIs & Services &gt; Enabled APIs & services</strong>. Click <strong>+ ENABLE APIS AND SERVICES</strong> and search for "Google Sheets API". Select it and click <strong>Enable</strong>.</li>
                                    <li>Go to <strong>APIs & Services &gt; Credentials</strong>. Click <strong>+ CREATE CREDENTIALS</strong> and select <strong>OAuth client ID</strong>.</li>
                                    <li>If prompted, configure your consent screen. For "User Type", select "External". Fill in the required app information. Add `https://developers.google.com/oauthplayground` to your "Authorized redirect URIs" for now.</li>
                                    <li>For "Application type", select "Web application".</li>
                                    <li>Under "Authorized redirect URIs", add your application's specific redirect URI (e.g., `http://localhost:3000/api/auth/callback/google`).</li>
                                    <li>Click <strong>Create</strong>. Your Client ID and Client Secret will be displayed.</li>
                                </ol>
                                <Button variant="outline" size="sm" asChild className="mt-2">
                                    <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-3 w-3" />
                                        Go to Google Cloud
                                    </a>
                                </Button>
                           </div>
                           <div className="p-4 bg-secondary rounded-md space-y-2">
                                <h4 className="font-semibold">Step 2: Enter Credentials</h4>
                                <p className="text-xs text-muted-foreground">Enter the credentials you obtained below.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="client-id">Client ID</Label>
                                    <Input id="client-id" placeholder="Your Google Client ID" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="client-secret">Client Secret</Label>
                                    <Input id="client-secret" type="password" placeholder="Your Google Client Secret" />
                                </div>
                           </div>
                           <div className="p-4 bg-secondary rounded-md space-y-2">
                                <h4 className="font-semibold">Step 3: Specify Sheet</h4>
                                <p className="text-xs text-muted-foreground">Enter the ID of the Google Sheet where you want to sync data. You can find this in your Google Sheet URL: `.../spreadsheets/d/`<strong>`SHEET_ID`</strong>`/edit`</p>
                                <Input placeholder="Google Sheet ID" />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline">Cancel</Button>
                            <Button>Save Configuration</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
               ) : (
                <Button size="sm" disabled={!enabledIntegrations.includes(integration.name)}>
                  <Settings className="mr-2 h-4 w-4"/>
                  Settings
                </Button>
               )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
