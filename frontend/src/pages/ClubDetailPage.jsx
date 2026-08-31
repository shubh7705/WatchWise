import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Heart,
  Send,
  Image as ImageIcon,
  Share2,
  Check
} from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';

export const ClubDetailPage = ({ clubId, onBack }) => {
  const { clubs, joinClub, addClubPost, addClubComment, likeClubPost, showToast } = useMovies();
  const { currentUser } = useAuth();

  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  const club = clubs.find(c => c.id === Number(clubId));

  if (!club) {
    return (
      <div className="app-container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Club not found</h2>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to clubs
        </button>
      </div>
    );
  }

  const isMember = currentUser ? club.members?.includes(currentUser.id) : false;

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postContent.trim() && !postImage.trim()) return;

    addClubPost(club.id, {
      content: postContent,
      image: postImage || null
    });

    setPostContent('');
    setPostImage('');
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addClubComment(club.id, postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="app-container" style={{ paddingBottom: '80px', maxWidth: '900px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn btn-ghost btn-sm"
        style={{ margin: '16px 0 20px', borderRadius: 'var(--radius-full)' }}
      >
        <ArrowLeft size={16} /> Back to Clubs
      </button>

      {/* Club Banner Header */}
      <div
        className="glass-panel"
        style={{
          overflow: 'hidden',
          marginBottom: '32px',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '180px',
            backgroundImage: `url(${club.banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(9,12,21,0.2) 0%, rgba(9,12,21,0.95) 100%)'
            }}
          />
        </div>

        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, marginBottom: '6px' }}>
                {club.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '14px', maxWidth: '650px' }}>
                {club.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Users size={14} color="var(--primary)" /> {club.members_count || club.members?.length || 0} members
                </span>
                <span>Created by @{club.created_by_name || 'Admin'}</span>
              </div>
            </div>

            <button
              onClick={() => joinClub(club.id)}
              className={`btn ${isMember ? 'btn-secondary' : 'btn-primary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {isMember ? <Check size={16} /> : <Users size={16} />}
              <span>{isMember ? 'Member' : 'Join Club'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create New Post Box */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          marginBottom: '32px',
          border: '1px solid var(--border-glass)'
        }}
      >
        <form onSubmit={handleCreatePost}>
          <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
            <img
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest'}
              alt={currentUser?.username || 'User'}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              <textarea
                className="input-modern"
                rows={3}
                placeholder="Start a conversation in this club... (e.g. your thoughts on a recent movie, debate, or question)"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="url"
                placeholder="Attach image URL (Optional)"
                value={postImage}
                onChange={(e) => setPostImage(e.target.value)}
                className="input-modern"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={!postContent.trim() && !postImage.trim()}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <Send size={15} /> Publish to Club
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--primary)" /> Discussion Feed ({club.posts?.length || 0})
        </h3>

        {club.posts && club.posts.length > 0 ? (
          club.posts.map((post) => (
            <div key={post.id} className="glass-card" style={{ padding: '24px' }}>
              {/* Author header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <img
                  src={post.user_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + post.username}
                  alt={post.username}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{post.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: post.image ? '14px' : '16px' }}>
                {post.content}
              </p>

              {/* Post Image */}
              {post.image && (
                <div
                  style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    maxHeight: '360px',
                    marginBottom: '16px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <img src={post.image} alt="Post attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Likes & Comments Counters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginBottom: '16px' }}>
                <button
                  onClick={() => likeClubPost(club.id, post.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: post.likes > 0 ? '#f43f5e' : 'var(--text-secondary)', padding: '4px 8px' }}
                >
                  <Heart size={16} fill={post.likes > 0 ? '#f43f5e' : 'none'} />
                  <span>{post.likes} Likes</span>
                </button>

                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} /> {post.comments?.length || 0} Comments
                </span>
              </div>

              {/* Comments Thread */}
              {post.comments && post.comments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
                  {post.comments.map((c) => (
                    <div key={c.id} style={{ fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: '6px' }}>
                        @{c.username}:
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{c.content}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment(post.id);
                  }}
                  className="input-modern"
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  Reply
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <MessageSquare size={36} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '10px' }} />
            <h4>No conversations yet</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Be the first to post a question or review in this club!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
