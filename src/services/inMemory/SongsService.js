/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

class SongsService {
  constructor() {
    this._songs = [];
  }

  addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = nanoid(16);

    const newSongs = {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
      id,
    };

    this._songs.push(newSongs);

    const isSuccess = this._songs.filter((songs) => songs.id === id).length > 0;

    if (!isSuccess) {
      throw new ClientError('Lagu gagal ditambahkan');
    }

    return id;
  }

  getSongs() {
    return this._songs;
  }

  getSongById(id) {
    const songs = this._songs.filter((n) => n.id === id)[0];
    if (!songs) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    return songs;
  }

  editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const index = this._songs.findIndex((songs) => songs.id === id);

    if (index === -1) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }

    this._songs[index] = {
      ...this._songs[index],
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
      id,
    };
  }

  deleteSongById(id) {
    const index = this._songs.findIndex((songs) => songs.id === id);
    if (index === -1) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
    this._songs.splice(index, 1);
  }
}

module.exports = SongsService;
