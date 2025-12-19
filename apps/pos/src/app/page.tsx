import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { POSHeader } from "@/components/POSHeader";
import { getOpenAccounts } from "./actions";
import { POSContent } from "@/components/POSContent";

export default async function POSHome() {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile for display name
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single()

    // Get open accounts
    const accounts = await getOpenAccounts()

    return (
        <div className="min-h-screen flex flex-col bg-marfil">
            {/* Header with user info and logout */}
            <POSHeader
                userEmail={user.email}
                userName={profile?.display_name}
            />

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-6">
                <POSContent initialAccounts={accounts} />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-gray-600">
                        © 2025 Trailer Burger Hall • Sistema POS v0.1.0
                    </p>
                </div>
            </footer>
        </div>
    );
}
