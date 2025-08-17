import React, { useState } from 'react';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { useMusic } from '../../contexts/MusicContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Play, Pause, MoreHorizontal, Trash2, Edit3, 
  GripVertical, Download, Share, Clock, Music 
} from 'lucide-react';

const PlaylistManager = ({ playlist, onEdit, onClose }) => {
  const { updatePlaylist, removeSongFromPlaylist } = usePlaylist();
  const { currentSong, isPlaying, playSong, pauseSong } = useMusic();
  const [draggedSongs, setDraggedSongs] = useState(playlist.songs || []);
  const [showMenu, setShowMenu] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: playlist.name,
    description: playlist.description || ''
  });

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(draggedSongs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDraggedSongs(items);

    // Update playlist order in backend
    try {
      await updatePlaylist(playlist.id, { songs: items });
    } catch (error) {
      console.error('Error reordering songs:', error);
      // Revert on error
      setDraggedSongs(playlist.songs || []);
    }
  };

  const handleRemoveSong = async (songId) => {
    if (window.confirm('Remove this song from the playlist?')) {
      try {
        await removeSongFromPlaylist(playlist.id, songId);
        setDraggedSongs(prev => prev.filter(song => song.id !== songId));
      } catch (error) {
        console.error('Error removing song:', error);
      }
    }
  };

  const handlePlayPlaylist = () => {
    if (draggedSongs.length > 0) {
      playSong(draggedSongs[0], draggedSongs);
    }
  };

  const handleEditSave = async () => {
    try {
      await updatePlaylist(playlist.id, editData);
      setIsEditing(false);
      if (onEdit) onEdit(editData);
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return draggedSongs.reduce((total, song) => total + (song.duration || 0), 0);
  };

  const isCurrentSong = (song) => {
    return currentSong && currentSong.id === song.id;
  };

  const handlePlayPause = (song, index) => {
    if (isCurrentSong(song) && isPlaying) {
      pauseSong();
    } else {
      playSong(song, draggedSongs, index);
    }
  };

  return (
    <div className="bg-dark-200 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-600/20 to-dark-200 p-8">
        <div className="flex items-end space-x-6">
          <div className="w-48 h-48 rounded-lg shadow-2xl overflow-hidden">
            <img
              src={playlist.imageUrl || draggedSongs[0]?.imageUrl || '/default-playlist.jpg'}
              alt={playlist.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/default-playlist.jpg';
              }}
            />
          </div>
          
          <div className="flex-1">
            <p className="text-gray-300 text-sm uppercase tracking-wider mb-2">Playlist</p>
            
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-transparent border-none text-white text-5xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2"
                />
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description..."
                  className="bg-dark-100 border border-gray-600 rounded p-2 text-gray-300 w-full resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditSave}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-white text-5xl font-bold mb-4">{playlist.name}</h1>
                {playlist.description && (
                  <p className="text-gray-300 mb-4">{playlist.description}</p>
                )}
                <div className="flex items-center space-x-4 text-gray-400 text-sm">
                  <span>{draggedSongs.length} songs</span>
                  <span>•</span>
                  <span>{formatDuration(getTotalDuration())}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex items-center space-x-4 mt-8">
            <button
              onClick={handlePlayPlaylist}
              disabled={draggedSongs.length === 0}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full p-4 transition-all hover:scale-105"
            >
              <Play size={24} className="ml-0.5" />
            </button>
            
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-white transition-colors p-2"
              title="Edit Playlist"
            >
              <Edit3 size={24} />
            </button>
            
            <button className="text-gray-400 hover:text-white transition-colors p-2">
              <Download size={24} />
            </button>
            
            <button className="text-gray-400 hover:text-white transition-colors p-2">
              <Share size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Songs List */}
      <div className="p-8">
        {/* List Header */}
        <div className="flex items-center space-x-4 px-4 py-2 border-b border-gray-700 mb-4">
          <div className="w-8">#</div>
          <div className="flex-1 text-gray-400 text-sm uppercase tracking-wider">Title</div>
          <div className="hidden md:block flex-1 text-gray-400 text-sm uppercase tracking-wider">Album</div>
          <div className="w-16 text-right">
            <Clock size={16} className="text-gray-400" />
          </div>
          <div className="w-10"></div>
        </div>

        {draggedSongs.length === 0 ? (
          <div className="text-center py-16">
            <Music size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-400 text-lg mb-2">Your playlist is empty</h3>
            <p className="text-gray-500">Add some songs to get started</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="playlist">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-1 ${
                    snapshot.isDraggingOver ? 'bg-primary-500/5 rounded-lg' : ''
                  }`}
                >
                  {draggedSongs.map((song, index) => (
                    <Draggable key={song.id} draggableId={song.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group flex items-center space-x-4 p-3 rounded-lg transition-all hover:bg-dark-100 ${
                            snapshot.isDragging ? 'bg-dark-100 shadow-lg' : ''
                          } ${isCurrentSong(song) ? 'bg-primary-500/10' : ''}`}
                        >
                          {/* Drag Handle */}
                          <div {...provided.dragHandleProps} className="text-gray-400 hover:text-white transition-colors">
                            <GripVertical size={16} />
                          </div>

                          {/* Index/Play Button */}
                          <div className="w-8 flex justify-center">
                            <button
                              onClick={() => handlePlayPause(song, index)}
                              className={`p-1 rounded-full transition-colors ${
                                isCurrentSong(song) 
                                  ? 'text-primary-500 hover:text-primary-400' 
                                  : 'text-white hover:scale-110 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              {isCurrentSong(song) && isPlaying ? (
                                <Pause size={16} />
                              ) : (
                                <Play size={16} />
                              )}
                            </button>
                            {!isCurrentSong(song) && (
                              <span className="text-gray-400 text-sm group-hover:hidden">
                                {index + 1}
                              </span>
                            )}
                          </div>

                          {/* Song Info */}
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <img
                              src={song.imageUrl || '/default-album.jpg'}
                              alt={song.title}
                              className="w-10 h-10 rounded object-cover"
                              onError={(e) => {
                                e.target.src = '/default-album.jpg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium truncate ${
                                isCurrentSong(song) ? 'text-primary-500' : 'text-white'
                              }`}>
                                {song.title}
                              </h4>
                              <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                            </div>
                          </div>

                          {/* Album (Hidden on mobile) */}
                          <div className="hidden md:block flex-1 min-w-0">
                            <p className="text-gray-400 text-sm truncate">{song.album || 'Unknown Album'}</p>
                          </div>

                          {/* Duration */}
                          <span className="text-gray-400 text-sm w-16 text-right">
                            {formatDuration(song.duration)}
                          </span>

                          {/* More Options */}
                          <div className="relative w-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(showMenu === song.id ? null : song.id);
                              }}
                              className="text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu === song.id && (
                              <div className="absolute right-0 top-8 bg-dark-100 border border-gray-600 rounded-lg shadow-xl py-2 min-w-48 z-20">
                                <button
                                  onClick={() => {
                                    handleRemoveSong(song.id);
                                    setShowMenu(null);
                                  }}
                                  className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove from playlist</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default PlaylistManager;