
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MessagesPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Messages</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>A list of messages will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
