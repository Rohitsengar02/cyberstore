
"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function SecurityPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Security</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password here. After saving, you'll be logged out.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                </CardContent>
                <CardContent>
                     <Button>Update Password</Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Enable 2FA</h3>
                            <p className="text-sm text-muted-foreground">Secure your account with a second factor.</p>
                        </div>
                        <Switch id="2fa-switch" />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Login History</CardTitle>
                     <CardDescription>A record of recent sign-ins to your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Chrome on macOS</p>
                            <p className="text-sm text-muted-foreground">New York, USA - 1 hour ago</p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Safari on iPhone</p>
                            <p className="text-sm text-muted-foreground">London, UK - 3 days ago</p>
                        </div>
                    </div>
                     <Separator />
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Firefox on Windows</p>
                            <p className="text-sm text-muted-foreground">Tokyo, Japan - 1 week ago</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
