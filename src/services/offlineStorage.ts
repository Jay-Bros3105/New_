import { Post, SyncAction } from '../types';

const SYNC_QUEUE_KEY = 'fastline_sync_queue';
const OFFLINE_POSTS_KEY = 'fastline_offline_posts';

export const offlineStorage = {
  getSyncQueue(): SyncAction[] {
    const data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addToSyncQueue(action: SyncAction) {
    const queue = this.getSyncQueue();
    queue.push(action);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  clearSyncQueue() {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  },

  getOfflinePosts(): Post[] {
    const data = localStorage.getItem(OFFLINE_POSTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveOfflinePost(post: Post) {
    const posts = this.getOfflinePosts();
    posts.unshift(post);
    localStorage.setItem(OFFLINE_POSTS_KEY, JSON.stringify(posts));
    
    this.addToSyncQueue({
      id: post.id,
      type: 'post',
      payload: post,
      timestamp: Date.now()
    });
  }
};
