import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const email = 'admin.observatoire@feelinx.dev';
    const password = 'observatoire2025';
    const firstName = 'Admin';
    const lastName = 'Observatoire';

    // Check if user already exists
    const { data: existingUser } = await supabaseClient.auth.admin.listUsers();
    const userExists = existingUser?.users.find(u => u.email === email);

    if (userExists) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'L\'administrateur Observatoire existe déjà',
          user_id: userExists.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Create user in auth.users
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    if (!authUser.user) {
      throw new Error('Failed to create user');
    }

    console.log('Auth user created:', authUser.user.id);

    // Create profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        user_id: authUser.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Rollback: delete auth user
      await supabaseClient.auth.admin.deleteUser(authUser.user.id);
      throw profileError;
    }

    console.log('Profile created');

    // Assign admin_observatoire role
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin_observatoire'
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Rollback: delete profile and auth user
      await supabaseClient.from('profiles').delete().eq('user_id', authUser.user.id);
      await supabaseClient.auth.admin.deleteUser(authUser.user.id);
      throw roleError;
    }

    console.log('Role assigned');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authUser.user.id,
        email: email 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in create-observatoire-admin function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
