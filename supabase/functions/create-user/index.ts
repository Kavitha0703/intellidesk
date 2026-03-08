import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter
// Stores: { [userId]: { count: number, resetTime: number } }
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; retryAfterMs?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  // If no record or window expired, create new window
  if (!userLimit || now >= userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }
  
  // Check if limit exceeded
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { 
      allowed: false, 
      remaining: 0, 
      retryAfterMs: userLimit.resetTime - now 
    };
  }
  
  // Increment counter
  userLimit.count++;
  rateLimitStore.set(userId, userLimit);
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - userLimit.count };
}

// Input validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

function isValidName(name: string): boolean {
  return typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 100;
}

function isValidPassword(password: string): boolean {
  // Minimum 8 characters, at least one letter and one number
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

function isValidRole(role: string): boolean {
  return role === 'admin' || role === 'user';
}

function sanitizeInput(input: string): string {
  return input.trim();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("Create user request rejected: No authorization header");
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
      console.log("Create user request rejected: Invalid user token");
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
      console.log(`Create user request rejected: User ${callingUser.id} is not an admin`);
      return new Response(
        JSON.stringify({ error: "Only admins can create users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting check - applies to authenticated admins
    const rateLimit = checkRateLimit(callingUser.id);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.retryAfterMs || 60000) / 1000);
      console.log(`Create user request rejected: Rate limit exceeded for admin ${callingUser.id}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Remaining": "0"
          } 
        }
      );
    }

    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email, password, role } = body;

    // Validate required fields exist
    if (!name || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, password, role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input types
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof role !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid input types" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedRole = sanitizeInput(role);

    // Validate name
    if (!isValidName(sanitizedName)) {
      return new Response(
        JSON.stringify({ error: "Name must be between 1 and 100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password
    if (!isValidPassword(password)) {
      return new Response(
        JSON.stringify({ error: "Password must be between 8 and 128 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role
    if (!isValidRole(sanitizedRole)) {
      return new Response(
        JSON.stringify({ error: "Role must be 'admin' or 'user'" }),
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
    // SECURITY: Do NOT pass role in user_metadata — role is set explicitly below
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: sanitizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: sanitizedName },
    });

    if (createError) {
      console.log(`Failed to create user: ${createError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to create user. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: Explicitly set role in user_roles table using service-role client
    // The trigger assigns 'user' by default; if a different role is requested, update it
    if (sanitizedRole !== 'user') {
      const { error: roleError } = await adminClient
        .from('user_roles')
        .update({ role: sanitizedRole })
        .eq('user_id', newUser.user.id);

      if (roleError) {
        console.log(`Failed to set role for user ${newUser.user.id}: ${roleError.message}`);
        // User was created but role assignment failed — clean up
        await adminClient.auth.admin.deleteUser(newUser.user.id);
        return new Response(
          JSON.stringify({ error: "Failed to assign role. User was not created." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`User created successfully: ${newUser.user.id} with role: ${sanitizedRole}`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: newUser.user.id, 
          email: newUser.user.email,
          name: sanitizedName,
          role: sanitizedRole
        } 
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rateLimit.remaining)
        } 
      }
    );
  } catch (error) {
    console.error("Unexpected error in create-user function");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
