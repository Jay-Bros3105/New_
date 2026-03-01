export interface User {
  id: string;
  phone: string;
  name: string;
  avatar: string;
  sync_status: 'synced' | 'pending';
}

export interface Post {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video';
  media_url?: string;
  likes: number;
  created_at: string;
  is_offline?: boolean;
}

export interface Group {
  id: string;
  name: string;
  type: 'study' | 'class' | 'school' | 'local';
  description: string;
  created_by: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  user_name?: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  media_url?: string;
  reactions?: Reaction[];
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  is_offline?: boolean;
}

export interface Reaction {
  user_id: string;
  emoji: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  is_group: boolean;
  name?: string;
  avatar?: string;
}

export interface SyncAction {
  id: string;
  type: 'post' | 'like' | 'message' | 'join_group';
  payload: any;
  timestamp: number;
}
