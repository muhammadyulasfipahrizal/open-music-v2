const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylist(playlistId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongByPlaylistIdHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._songsService.getSongById(songId);
    await this._service.verifyPlaylistsAccess(playlistId, credentialId);
    await this._service.addSongToPlaylist(playlistId, songId);

    await this._service.addPlaylistActivities(
      playlistId,
      songId,
      credentialId,
      'add',
    );
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan pada playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsByPlaylistIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistsAccess(playlistId, credentialId);
    const playlistDetails = await this._service.getPlaylistDetails(
      playlistId,
    );
    const playlistSongs = await this._service.getPlaylistSongs(playlistId);

    return {
      status: 'success',
      data: {
        playlist: {
          id: playlistDetails.id,
          name: playlistDetails.name,
          username: playlistDetails.username,
          songs: playlistSongs,
        },
      },
    };
  }

  async deleteSongByPlaylistIdHandler(request) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._service.verifyPlaylistsAccess(playlistId, credentialId);

    await this._service.deleteSongFromPlaylist(
      playlistId,
      songId,
      credentialId,
    );

    await this._service.addPlaylistActivities(
      playlistId,
      songId,
      credentialId,
      'delete',
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getActivitiesByPlaylistIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsAccess(playlistId, credentialId);
    const activities = await this._service.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
