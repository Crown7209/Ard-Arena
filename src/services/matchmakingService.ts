import { supabase } from "@/lib/supabase";

export interface MatchmakingPlayer {
  id: string;
  user_id: string;
  username: string | null;
  email: string;
  created_at: string;
}

export const matchmakingService = {
  // Add player to matchmaking queue (using a simple approach with localStorage + realtime)
  // For now, we'll use a channel-based approach
  async joinQueue(userId: string): Promise<boolean> {
    // Store in localStorage for now (can be improved with a proper table)
    const queueKey = "matchmaking_queue";
    const queue = JSON.parse(localStorage.getItem(queueKey) || "[]");
    if (!queue.includes(userId)) {
      queue.push(userId);
      localStorage.setItem(queueKey, JSON.stringify(queue));
    }
    return true;
  },

  // Remove player from matchmaking queue
  async leaveQueue(userId: string): Promise<void> {
    const queueKey = "matchmaking_queue";
    const queue = JSON.parse(localStorage.getItem(queueKey) || "[]");
    const filtered = queue.filter((id: string) => id !== userId);
    localStorage.setItem(queueKey, JSON.stringify(filtered));
  },

  // Get all active players in queue (from users who are online)
  async getActivePlayers(): Promise<MatchmakingPlayer[]> {
    // Get users who are in the matchmaking queue
    const queueKey = "matchmaking_queue";
    const queue = JSON.parse(localStorage.getItem(queueKey) || "[]");
    
    if (queue.length === 0) return [];

    // Fetch user details for players in queue
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, created_at")
      .in("id", queue);

    if (error) {
      console.error("Error fetching active players:", error);
      return [];
    }

    return (data || []).map((user) => ({
      id: user.id,
      user_id: user.id,
      username: user.username || null,
      email: user.email || "",
      created_at: user.created_at || "",
    }));
  },

  // Find a random match
  async findMatch(userId: string): Promise<string | null> {
    const queueKey = "matchmaking_queue";
    const queue = JSON.parse(localStorage.getItem(queueKey) || "[]");
    
    // Filter out current user
    const otherPlayers = queue.filter((id: string) => id !== userId);
    
    if (otherPlayers.length === 0) {
      return null;
    }

    // Pick a random player
    const randomIndex = Math.floor(Math.random() * otherPlayers.length);
    const matchedUserId = otherPlayers[randomIndex];

    // Remove both players from queue
    const filtered = queue.filter((id: string) => id !== userId && id !== matchedUserId);
    localStorage.setItem(queueKey, JSON.stringify(filtered));

    return matchedUserId;
  },
};

