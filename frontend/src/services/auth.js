import { supabase } from './supabaseClient';

export async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getCurrentUser() {
  return supabase.auth.getUser();
}

export async function fetchUserData(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchUserExerciseHistory(userId) {
  const { data, error } = await supabase
    .from('user_exercise_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateUserXpAndLevel(userId, xp, nivel) {
  const { data, error } = await supabase
    .from('users')
    .update({ xp, nivel })
    .eq('id', userId);
  if (error) throw error;
  return data;
}

export async function fetchRandomExercise() {
  const { data, error } = await supabase
    .from('exercises')
    .select('*');
  if (error) throw error;
  if (!data || data.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export async function fetchFilteredExercise({ type, level, tag }) {
  let query = supabase.from('exercises').select('*');
  if (type) query = query.eq('type', type);
  if (level) query = query.eq('level', level);
  if (tag) query = query.contains('tags', [tag]);
  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password',
  });
  if (error) throw error;
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
} 