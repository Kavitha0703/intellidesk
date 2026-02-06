 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 Deno.serve(async (req) => {
   // Handle CORS preflight requests
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     // Get the authorization header
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       return new Response(
         JSON.stringify({ error: "No authorization header" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
      // Create a Supabase client with the user's token to verify they're an admin
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 
     const userClient = createClient(supabaseUrl, supabaseAnonKey, {
       global: { headers: { Authorization: authHeader } },
     });
 
     // Get the calling user
     const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser();
     if (userError || !callingUser) {
       return new Response(
         JSON.stringify({ error: "Unauthorized" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Check if the calling user is an admin
     const { data: roleData, error: roleError } = await userClient
       .from("user_roles")
       .select("role")
       .eq("user_id", callingUser.id)
       .maybeSingle();
 
     if (roleError || !roleData || roleData.role !== "admin") {
       return new Response(
         JSON.stringify({ error: "Only admins can create users" }),
         { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Parse the request body
     const { name, email, password, role } = await req.json();
 
     if (!name || !email || !password || !role) {
       return new Response(
         JSON.stringify({ error: "Missing required fields: name, email, password, role" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Use the service role client to create the user
     const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
       auth: {
         autoRefreshToken: false,
         persistSession: false,
       },
     });
 
     // Create the user with admin API (auto-confirms the user)
     const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
       email,
       password,
       email_confirm: true, // Auto-confirm the email
       user_metadata: { name, role },
     });
 
     if (createError) {
       return new Response(
         JSON.stringify({ error: createError.message }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         user: { 
           id: newUser.user.id, 
           email: newUser.user.email,
           name,
           role 
         } 
       }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Error creating user:", error);
     return new Response(
       JSON.stringify({ error: "Internal server error" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });